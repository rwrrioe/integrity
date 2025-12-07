package rest

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/service"
	"github.com/rwrrioe/integrity/backend/internal/storage"
	ws_handlers "github.com/rwrrioe/integrity/backend/internal/transport/ws/handlers"
	"github.com/rwrrioe/integrity/backend/internal/transport/ws/ws_hub"
)

var jwtSecret = []byte("secretsecret")

var users = map[string]struct {
	Password string
	Name     string
	Role     string
}{
	"alice@gmail.com": {Password: "alice123", Name: "Alice", Role: "admin"},
	"bob@example.com": {Password: "bob123", Name: "bob", Role: "employee"},
}

type Handler struct {
	defectService     *service.DefectService
	defectRepo        *repository.DefectRepository
	hmapService       *service.HeatmapService
	objsService       *service.ObjectService
	inspectionService *service.InspectionService
	csvService        *service.SCVParser
	reportService     *service.ReportService
	hub               *ws_hub.WebSocketHub
	redis             *storage.RedisStorage
}

func NewHandler(dr *service.DefectService, repo *repository.DefectRepository, hmap *service.HeatmapService, objsService *service.ObjectService, inspectionService *service.InspectionService, csv *service.SCVParser, redis *storage.RedisStorage, rs *service.ReportService, ws *ws_hub.WebSocketHub) *Handler {
	return &Handler{
		defectService:     dr,
		inspectionService: inspectionService,
		defectRepo:        repo,
		objsService:       objsService,
		csvService:        csv,
		reportService:     rs,
		hub:               ws,
		hmapService:       hmap,
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("X-Token")
		if token == "" {
			c.JSON(401, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		user, ok := users[token]
		if !ok {
			c.JSON(401, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		c.Set("user", user)
		c.Next()
	}
}

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRaw, exists := c.Get("user")
		if !exists {
			c.JSON(401, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		user := userRaw.(map[string]string)
		role := user["role"]

		if role != "admin" {
			c.JSON(403, gin.H{"error": "forbidden, admin only"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (h *Handler) InitRoutes() *gin.Engine {
	r := gin.Default()

	r.POST("/register", func(c *gin.Context) {
		var req struct{ Email, Password, Name string }
		c.BindJSON(&req)
		users[req.Email] = struct{ Password, Name, Role string }{req.Password, req.Name, "employee"}
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.POST("/login", func(c *gin.Context) {
		var req struct{ Email, Password string }
		c.BindJSON(&req)
		user, ok := users[req.Email]
		if !ok || user.Password != req.Password {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}
		// просто возвращаем email как токен
		c.JSON(200, gin.H{"token": req.Email})
	})

	admin := r.Group("/admin", AuthMiddleware(), AdminOnly())
	admin.GET("/dashboard", h.GetDashboard)

	// WebSocket
	wsHandler := ws_handlers.NewHandler(h.hub)
	r.GET("/ws", wsHandler.WebSocket)

	api := r.Group("/api")
	{
		// 1. Dashboard (Сводные данные)

		// 2. Defects (Списки + Детали)
		api.GET("/defects", h.ListDefects)
		api.GET("/defects/:id", h.GetDefectDetail)

		// 3. Import
		api.POST("/import/csv", h.ImportCSV)

		// 4. Reports
		api.GET("/reports", h.ExportReport)
		api.GET("/reports/export", h.ExportReport)
		api.GET("/pipelines/:id")

		// 5. Actions (Websocket trigger)
		api.GET("/heatmap", h.GetHeatmap)
		api.POST("/heatmap", h.GetHeatmapData)
		api.GET("/objects/:id", h.GetObject)
		api.POST("objects/:id")
	}
	return r
}

// POST /api/objects/:id
func (h *Handler) CallAI(c *gin.Context) {
	id := c.Param("id")
	idInt, _ := strconv.Atoi(c.Param("id"))

	go func() {
		h.hub.Notify(id, gin.H{"status": "accepted", "id": id})
		res, err := h.objsService.ExposeAlert(c, uint(idInt))
		if err != nil {
			h.hub.Notify(id, gin.H{"status": "error", "id": id})
			return
		}
		h.hub.Notify(id, gin.H{"prediction": res.Probability, "condition": res.Condition})

		if res.Probability > 70 {
			resul, err := h.defectService.AutoEmployeeAssign(c, res.ObjectId, 2)
			if err != nil {
				h.hub.Notify(id, gin.H{"status": "error", "id": id})
				return
			}

			h.hub.Notify(id, gin.H{"team": *resul, "object": id})
		}
	}()
	c.JSON(http.StatusAccepted, gin.H{"id": id})
}

func (h *Handler) GetObject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	res, err := h.objsService.GetObjectInfo(c, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"object_info": res,
		"id":          id,
	})
}

// --- Implementation ---
// GET /api/pipelines/:id
func (h *Handler) GetPipeline(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	avgImp, err := h.defectRepo.GetAvgImportanceByPipeline(c, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	objs, _, err := h.defectRepo.ListObjectsByPipeline(c, uint(id), 1, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	defs, _, err := h.defectRepo.ListByPipeline(c, uint(id), 1, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	stats, err := h.defectRepo.GetPipelineStats(c, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avg_imp":       avgImp,
		"objects_count": stats.TotalObjects,
		"defect_count":  stats.TotalDefects,
		"distribution":  stats.StatusDistribution,
		"objects":       objs,
		"defects":       defs,
	})
}

// GET /api/dashboard
func (h *Handler) GetDashboard(c *gin.Context) {
	ctx := c.Request.Context()

	defbyYear, err := h.defectService.DefectsByYears(ctx, 2019, 2020, 2021, 2022, 2023)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByYear"})
		return
	}

	defbyCrit, err := h.defectService.DefectsByCriticality(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByCrit"})
	}

	top5, err := h.defectService.Top5Defects(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByCrit"})
	}

	inspectionsByYear, err := h.inspectionService.InspectionsByYears(ctx, 2019, 2020, 2021)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByCrit"})
	}
	inspectionsByMethod, err := h.inspectionService.InspectionsByMethods(ctx, []int{12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByCrit"})
	}

	c.JSON(http.StatusOK, gin.H{
		"metrics": gin.H{
			"top_5":        top5,
			"total":        2663,
			"active_pipes": 3,
			"inspections":  12185,
		},
		"charts": gin.H{
			"defs_by_year":          defbyYear,
			"defs_by_criticality":   defbyCrit,
			"inspections_by_year":   inspectionsByYear,
			"inspections_by_method": inspectionsByMethod,
		},
		// Top Risks можно получить отдельным запросом к репо с сортировкой
	})
}

// GET /api/defects?page=1&limit=10&search=Corrosion
func (h *Handler) ListDefects(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filter := entities.DefectFilter{
		Page:   page,
		Limit:  limit,
		Search: c.Query("search"),
	}
	data, total, err := h.defectRepo.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": data,
		"meta": gin.H{"total": total, "page": page, "limit": limit},
	})
}

// GET /api/defects/:id
func (h *Handler) GetDefectDetail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	defect, err := h.defectRepo.GetDefect(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}
	c.JSON(200, defect)
}

// POST /api/import/csv
func (h *Handler) ImportCSV(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "importCSV"})
		return
	}
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "importCSV"})
		return
	}
	defer f.Close()

	b, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "importCSV"})
		return
	}
	uuid := uuid.NewString()
	redisKey := fmt.Sprintf("import:scv:%s", uuid)
	h.redis.Set(c, redisKey, b)

	go func() {
		h.hub.Notify(uuid, gin.H{"id": uuid, "status": "processing"})
		err := h.csvService.ImportObjects(c, redisKey)
		if err != nil {
			h.hub.Notify(uuid, gin.H{"id": uuid, "status": "error"})
			return
		}
		err = h.csvService.ImportDiagnostics(c, redisKey)
		if err != nil {
			h.hub.Notify(uuid, gin.H{"id": uuid, "status": "error"})
			return
		}
		h.hub.Notify(uuid, gin.H{"id": uuid, "status": "done"})
	}()
	c.JSON(http.StatusAccepted, gin.H{"id": uuid})
}

// GET /api/heatmap
func (h *Handler) GetHeatmap(c *gin.Context) {
	hmap, err := h.hmapService.GetHeatMap(c)
	if err != nil {
		c.JSON(500, gin.H{"getHearmap": "error", "error": err.Error()})
	}

	defbyCrit, err := h.defectService.DefectsByCriticality(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "defByCrit"})
	}

	c.JSON(200, gin.H{"heatmap": hmap, "distribution": defbyCrit})
}

// POST /api/reports?type_id=1&id=1&&date_from=1&dateTo=2
func (h *Handler) CreateReport(c *gin.Context) {
	id := c.Query("id")
	typeId, _ := strconv.Atoi(c.Query("type_id"))

	if typeId == 1 {
		go func() {
			h.hub.Notify(id, gin.H{
				"status": "processing",
				"stage":  "creating report",
			})

			idInt, _ := strconv.Atoi(id)
			resp, err := h.reportService.GetSingleDefectReport(c, uint(idInt))
			if err != nil {
				h.hub.Notify(id, gin.H{"status": "error", "error": err.Error()})
				return
			}

			h.hub.Notify(id, gin.H{"status": "done", "report": resp})
		}()
		c.JSON(http.StatusAccepted, gin.H{"id": id})
	}

	if typeId == 2 {
		go func() {
			h.hub.Notify(id, gin.H{
				"status": "processing",
				"stage":  "creating report",
			})
			dateFrom := c.Query("date_from")
			dateTo := c.Query("date_to")

			tFrom, _ := time.Parse("2006-01-02", dateFrom)
			tTo, _ := time.Parse("2006-01-02", dateTo)

			idInt, _ := strconv.Atoi(id)
			resp, err := h.reportService.GetExecutiveReport(c, uint(idInt), tFrom, tTo)
			if err != nil {
				h.hub.Notify(id, gin.H{"status": "error", "error": err.Error()})
				return
			}

			h.hub.Notify(id, gin.H{"status": "done", "report": resp})
		}()

		c.JSON(http.StatusAccepted, gin.H{"id": id})
	}
}

// GET /api/reports/export?type_id=1&id=1&date_from=1&dateTo=2
func (h *Handler) ExportReport(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	typeId, _ := strconv.Atoi(c.Query("type_id"))

	if typeId == 1 {
		pdfBytes, err := h.reportService.GenerateDefectAnalysisPDF(c.Request.Context(), uint(id))
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.Header("Content-Disposition", "attachment; filename=report.pdf")
		c.Data(200, "application/pdf", pdfBytes)
	}

	if typeId == 2 {
		dateFrom := c.Query("date_from")
		dateTo := c.Query("date_to")

		tFrom, _ := time.Parse("2006-01-02", dateFrom)
		tTo, _ := time.Parse("2006-01-02", dateTo)

		pdfBytes, err := h.reportService.GenerateExecutivePDF(c.Request.Context(), uint(id), tTo, tFrom)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.Header("Content-Disposition", "attachment; filename=report.pdf")
		c.Data(200, "application/pdf", pdfBytes)
	}
}

// POST /api/heatmap?query
func (h *Handler) GetHeatmapData(c *gin.Context) {
	// 1. Парсинг ID трубы
	pipelineID, _ := strconv.Atoi(c.Query("pipeline_id"))

	// 2. Парсинг дат
	var dateFrom, dateTo time.Time
	layout := "2006-01-02"
	if val := c.Query("date_from"); val != "" {
		dateFrom, _ = time.Parse(layout, val)
	}
	if val := c.Query("date_to"); val != "" {
		dateTo, _ = time.Parse(layout, val)
		// Добавляем 24 часа, чтобы захватить весь последний день
		if !dateTo.IsZero() {
			dateTo = dateTo.Add(24 * time.Hour)
		}
	}

	// 3. Парсинг severity (теперь это одно число)
	severityInt, _ := strconv.Atoi(c.Query("severity"))

	// 4. Сборка фильтра
	filter := entities.DefectFilter{
		PipelineID: uint(pipelineID),
		DateFrom:   dateFrom,
		DateTo:     dateTo,
		Severity:   severityInt, // Передаем как uint (0 если не задано)
	}

	// 5. Получаем данные из репозитория
	points, err := h.defectRepo.GetHeatmapPoints(c.Request.Context(), filter)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// 6. Отдаем JSON
	// Если points == nil, отдаем пустой массив, чтобы фронт не упал
	if points == nil {
		c.JSON(200, []entities.HeatPoint{})
	} else {
		c.JSON(200, points)
	}
}
