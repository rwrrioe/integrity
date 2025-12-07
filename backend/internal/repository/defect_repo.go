package repository

import (
	"context"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

func Paginate(page, limit int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		switch {
		case limit > 100:
			limit = 100
		case limit <= 0:
			limit = 10
		}
		offset := (page - 1) * limit
		return db.Offset(offset).Limit(limit)
	}
}

type DefectRepo interface {
	ListByDate(ctx context.Context, date1 string, date2 string) (*[]entities.Defect, error)
	ListByYear(ctx context.Context, year int) (*[]entities.Defect, error)
	ListByType(ctx context.Context, defectTypeId uint) (*[]entities.Defect, error)
	ListImportantTypes(ctx context.Context, num int) (*[]entities.DefectStateMetrics, error)
	ListByMethod(ctx context.Context, method string) (*[]entities.Defect, error)
	GetAvgImportanceByObject(ctx context.Context, objectId uint) (float64, error)
	GetAvgImportanceByPipeline(ctx context.Context, pipelineId uint) (float64, error)
	ListByDepth(ctx context.Context, depth int) (*[]entities.Object, error)
	AssignEmployees(ctx context.Context, defectId uint, employeeIds []uint) error
	GetDefect(ctx context.Context, defectid uint) (*entities.Defect, error)
	FindNearestEmployees(ctx context.Context, defectId uint, num int) (*[]entities.Employee, error)
	CountCriticality(ctx context.Context) (*[]entities.DefectStateMetrics, error)
	PrepareHeatmap(ctx context.Context) (*entities.Heatmap, error)
	CountByStatus(ctx context.Context, pipelineId uint, status string) (*PipeCount, error)
	List(ctx context.Context, f entities.DefectFilter) ([]entities.Defect, int64, error)
	GetPipelineStats(ctx context.Context, pipelineId uint) (*entities.PipelineStats, error)
	ListByPipeline(ctx context.Context, pipelineId uint, page, limit int) ([]entities.Defect, int64, error)
	ListObjectsByPipeline(ctx context.Context, pipelineId uint, page, limit int) ([]entities.Object, int64, error)
	GetHeatmapPoints(ctx context.Context, f entities.DefectFilter) (*[]entities.HeatPoint, error)
}

type PipeCount struct {
	PipeName string `json:"pipe_name"`
	Count    int
}

type DefectStateModel struct {
	DefectType string `gorm:"column:name"`
	Count      int
}

type DefectRepository struct {
	db *gorm.DB
}

func NewDefectRepo(db *gorm.DB) *DefectRepository {
	return &DefectRepository{db: db}
}
func (r *DefectRepository) GetHeatmapPoints(ctx context.Context, f entities.DefectFilter) (*[]entities.HeatPoint, error) {
	var results []entities.HeatPoint

	// Используем кастомный SELECT для скорости и сразу маппим в структуру
	// Нам нужны координаты и severity (quality_grade_id) для расчета веса
	// В GORM можно сканировать в структуру, если имена полей совпадают (или через alias)

	query := r.db.WithContext(ctx).Table("defects").
		Select("defects.defect_id, defects.lat, defects.lon, defects.quality_grade_id").
		Joins("JOIN objects ON defects.object_id = objects.object_id")

	// --- КОПИРУЕМ ФИЛЬТРЫ (как в List) ---
	if f.PipelineID > 0 {
		query = query.Where("objects.pipeline_id = ?", f.PipelineID)
	}
	if !f.DateFrom.IsZero() {
		query = query.Where("defects.date >= ?", f.DateFrom)
	}
	if !f.DateTo.IsZero() {
		query = query.Where("defects.date <= ?", f.DateTo)
	}
	if f.Severity != 0 {
		query = query.Where("defects.quality_grade_id = ?", f.Severity)
	}

	// Выполняем запрос без Limit/Offset (нам нужны все точки для карты)
	// Сканируем во временную структуру, чтобы потом рассчитать Weight в Go
	type tempPoint struct {
		DefectId       uint
		DefectTypeId   uint
		Lat            float64
		Lon            float64
		QualityGradeId uint
	}
	var rows []tempPoint

	if err := query.Scan(&rows).Error; err != nil {
		return nil, err
	}

	// Преобразуем в HeatPoint и считаем вес
	for _, row := range rows {
		var weight float64

		// Логика веса в зависимости от severity (IDs из твоего списка)
		switch row.QualityGradeId {
		case 5: // "недопустимо" -> Максимально красный
			weight = 1.0
		case 4: // "требует_мер" -> Оранжевый
			weight = 0.7
		case 6: // "допустимо" -> Желтый
			weight = 0.4
		case 7: // "удовлетворительно" -> Зеленоватый/Тусклый
			weight = 0.2
		default:
			weight = 0.1
		}

		results = append(results, entities.HeatPoint{
			Id:     row.DefectId,
			Lat:    row.Lat,
			Lon:    row.Lon,
			Weight: weight,
			Class:  row.DefectTypeId,
		})
	}

	return &results, nil
}

func (r *DefectRepository) ListByPipeline(ctx context.Context, pipelineId uint, page, limit int) ([]entities.Defect, int64, error) {
	var dbDefects []models.Defect
	var total int64

	// Строим запрос с JOIN к таблице objects, так как pipeline_id находится там
	query := r.db.WithContext(ctx).
		Model(&models.Defect{}).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ?", pipelineId).
		Preload("Object").      // Подгружаем данные объекта
		Preload("DefectType").  // Подгружаем тип
		Preload("QualityGrade") // Подгружаем степень серьезности

	// Считаем общее количество для пагинации
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Получаем данные с пагинацией
	if err := query.Scopes(Paginate(page, limit)).
		Order("defects.date DESC").
		Find(&dbDefects).Error; err != nil {
		return nil, 0, err
	}

	// Маппим Model -> Entity
	var defects []entities.Defect
	for _, d := range dbDefects {
		defects = append(defects, DefectToEntity(d))
	}

	return defects, total, nil
}

func (r *DefectRepository) ListObjectsByPipeline(ctx context.Context, pipelineId uint, page, limit int) ([]entities.Object, int64, error) {
	var dbObjects []models.Object
	var total int64

	query := r.db.WithContext(ctx).
		Model(&models.Object{}).
		Where("pipeline_id = ?", pipelineId)

	// 1. Считаем общее количество
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 2. Получаем данные с пагинацией
	if err := query.Scopes(Paginate(page, limit)).
		Order("object_id ASC").
		Find(&dbObjects).Error; err != nil {
		return nil, 0, err
	}

	// 3. Маппим в entities
	var objects []entities.Object
	for _, obj := range dbObjects {
		objects = append(objects, ObjectToEntity(obj)) // Используем твой маппер ObjectToEntity
	}

	return objects, total, nil
}

func (r *DefectRepository) GetPipelineStats(ctx context.Context, pipelineId uint) (*entities.PipelineStats, error) {
	stats := &entities.PipelineStats{
		StatusDistribution: make(map[string]int64),
	}

	// 1. Total Objects
	if err := r.db.WithContext(ctx).Model(&models.Object{}).
		Where("pipeline_id = ?", pipelineId).
		Count(&stats.TotalObjects).Error; err != nil {
		return nil, err
	}

	// 2. Total Defects
	if err := r.db.WithContext(ctx).Model(&models.Defect{}).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ?", pipelineId).
		Count(&stats.TotalDefects).Error; err != nil {
		return nil, err
	}

	// 3. Critical Issues (Critical + High)
	// Проверь ID статусов в своей БД. Обычно это 3 и 4.
	criticalIDs := []int{4, 5}
	if err := r.db.WithContext(ctx).Model(&models.Defect{}).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ? AND defects.quality_grade_id IN (?)", pipelineId, criticalIDs).
		Count(&stats.CriticalIssues).Error; err != nil {
		return nil, err
	}

	// 4. Распределение по статусам (Created, Processing, Solved)
	// Используем GROUP BY для эффективности
	type statusResult struct {
		Status string
		Cnt    int64
	}
	var results []statusResult

	err := r.db.WithContext(ctx).Model(&models.Defect{}).
		Select("defects.status, count(*) as cnt").
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ?", pipelineId).
		Group("defects.status").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Заполняем map. Если статуса нет в БД, он просто не попадет в map (или можно инициализировать нулями)
	// Инициализируем нулями, чтобы на фронте не было undefined
	stats.StatusDistribution["Created"] = 0
	stats.StatusDistribution["Processing"] = 0
	stats.StatusDistribution["Solved"] = 0

	for _, res := range results {
		stats.StatusDistribution[res.Status] = res.Cnt
	}

	return stats, nil
}

func (r *DefectRepository) List(ctx context.Context, f entities.DefectFilter) ([]entities.Defect, int64, error) {
	var defects []entities.Defect
	var total int64

	query := r.db.WithContext(ctx).Model(&entities.Defect{}).
		Preload("Object").
		Preload("Pipeline")

	// Применяем фильтры
	if f.Search != "" {
		query = query.Where("defect_type_id = ?", "%"+f.Search+"%")
	}
	if f.PipelineID != 0 {
		query = query.Where("pipeline_id = ?", f.PipelineID)
	}

	if !f.DateFrom.IsZero() {
		query = query.Where("date >= ?", f.DateFrom)
	}
	if !f.DateTo.IsZero() {
		query = query.Where("date <= ?", f.DateTo)
	}

	// Считаем общее количество (для пагинации)
	query.Count(&total)

	// Пагинация
	offset := (f.Page - 1) * f.Limit
	err := query.Order("date DESC").Offset(offset).Limit(f.Limit).Find(&defects).Error

	return defects, total, err
}

func (r *DefectRepository) PrepareHeatmap(ctx context.Context) (*entities.Heatmap, error) {
	var defects []models.Defect

	if err := r.db.WithContext(ctx).Select("defect_id,lat, lon, defect_type_id, quality_grade_id").Find(&defects).Error; err != nil {
		return nil, err
	}

	points := make([]entities.HeatPoint, 0, len(defects))

	for _, d := range defects {
		var weight float64
		switch d.QualityGradeId {
		case 4:
			weight = 1.0
		case 3:
			weight = 0.8
		case 2:
			weight = 0.5
		default:
			weight = 0.2
		}

		if d.Depth > 3.0 || d.Vibration > 8.0 {
			weight = 1.0
		}

		points = append(points, entities.HeatPoint{
			Lat:    d.Lat,
			Lon:    d.Lon,
			Weight: weight,
			Id:     d.DefectId,
			Class:  d.DefectTypeId,
		})
	}

	return &entities.Heatmap{
		HeatPoints: points,
	}, nil
}

func (r *DefectRepository) ListImportantTypes(ctx context.Context, num int) (*[]entities.DefectStateMetrics, error) {

	var stats []DefectStateModel
	if err := r.db.WithContext(ctx).Table("defects").
		Select("defect_type_id, COUNT(*) as count").
		Group("defect_type_id").
		Order("count DESC").
		Limit(5).
		Scan(&stats).Error; err != nil {
		return nil, err
	}

	var metrics []entities.DefectStateMetrics
	for _, stat := range stats {
		metric := entities.DefectStateMetrics{
			Status: stat.DefectType,
			Count:  stat.Count,
		}

		metrics = append(metrics, metric)
	}

	return &metrics, nil
}

func (r *DefectRepository) ListByDate(ctx context.Context, date1 string, date2 string) (*[]entities.Defect, error) {
	var models []models.Defect

	if err := r.db.WithContext(ctx).Where("date >=? AND date<=?", date1, date2).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, model := range models {
		defect := DefectToEntity(model)
		defects = append(defects, defect)
	}
	return &defects, nil
}

func (r *DefectRepository) ListByType(ctx context.Context, defectTypeId uint) (*[]entities.Defect, error) {
	var models []models.Defect

	if err := r.db.WithContext(ctx).Where("defect_type_id=?", defectTypeId).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, model := range models {
		defect := DefectToEntity(model)
		defects = append(defects, defect)
	}
	return &defects, nil
}

func (r *DefectRepository) ListByMethod(ctx context.Context, method string) (*[]entities.Defect, error) {
	var models []models.Defect

	if err := r.db.WithContext(ctx).Where("method=?", method).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, model := range models {
		defect := DefectToEntity(model)
		defects = append(defects, defect)
	}
	return &defects, nil
}

func (r *DefectRepository) GetAvgImportanceByObject(ctx context.Context, objectId uint) (float64, error) {
	var avgImp float64

	if err := r.db.Select("ROUND(AVG(quality_grade_id), 2)").Where("object_id=?", objectId).Table("defects").Find(&avgImp).Error; err != nil {
		return 0.0, err
	}
	return avgImp, nil
}

func (r *DefectRepository) GetAvgImportanceByPipeline(ctx context.Context, pipelineId uint) (float64, error) {
	var avgImp float64

	if err := r.db.Model(&models.Defect{}).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Joins("JOIN pipelines ON objects.pipeline_id = pipelines.pipelined_id").
		Where("pipelines.pipeline_id=?", pipelineId).
		Select("ROUND(AVG(defects.quality_grade_id, 2)").
		Scan(&avgImp).Error; err != nil {
		return 0.0, err
	}
	return avgImp, nil
}

func (r *DefectRepository) CountByStatus(ctx context.Context, pipelineId uint, status string) (*PipeCount, error) {
	var counts PipeCount

	if err := r.db.Model(&models.Defect{}).
		Select("pipelines.name AS pipe_name, COUNT(status) AS count").
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Joins("JOIN pipelines ON objects.pipeline_id = pipelines.pipelined_id").
		Where("defects.status=?", status).
		Group("pipelines.name").
		Scan(&counts).Error; err != nil {
		return nil, err
	}
	return &counts, nil
}

func (r *DefectRepository) ListByDepth(ctx context.Context, depth int) (*[]entities.Object, error) {
	var models []models.Object

	if err := r.db.WithContext(ctx).Where("depth=?", depth).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var objects []entities.Object
	for _, model := range models {
		defect := ObjectToEntity(model)
		objects = append(objects, defect)
	}
	return &objects, nil
}

func (r *DefectRepository) AssignEmployees(ctx context.Context, defectId uint, employeeIds []uint) error {
	employees := make([]models.Employee, len(employeeIds))

	for i, id := range employeeIds {
		employees[i] = models.Employee{EmployeeId: id}
	}

	return r.db.WithContext(ctx).Model(&models.Defect{DefectId: defectId}).Association("Employees").Replace(employeeIds)
}

func (r *DefectRepository) GetDefect(ctx context.Context, defectId uint) (*entities.Defect, error) {
	var model models.Defect
	if err := r.db.WithContext(ctx).First(&model, "defect_id=?", defectId).Error; err != nil {
		return nil, err
	}

	defect := DefectToEntity(model)
	return &defect, nil
}

func (r *DefectRepository) FindNearestEmployees(ctx context.Context, defectId uint, num int) (*[]entities.Employee, error) {
	var defect models.Defect
	if err := r.db.WithContext(ctx).First(&defect, "defect_id=?", defectId).Error; err != nil {
		return nil, err
	}

	var models []models.Employee
	err := r.db.WithContext(ctx).Raw(`
		SELECT *
		FROM employees
		ORDER BY geography<-> ST_SetSRID(ST_MakePoint(?,?),4326)
		LIMIT ?
	`, defect.Lon, defect.Lat, num).Scan(&models).Error
	if err != nil {
		return nil, err
	}

	var employees []entities.Employee
	for _, model := range models {
		emp := EmployeeToEntity(model)
		employees = append(employees, emp)
	}
	return &employees, nil
}

func (r *DefectRepository) CountCriticality(ctx context.Context) (*[]entities.DefectStateMetrics, error) {
	var byCriticality []entities.DefectStateMetrics
	var metrics []DefectStateModel

	if err := r.db.WithContext(ctx).
		Table("defects").
		Select("quality_grade_id AS name, COUNT(*) AS count").
		Group("quality_grade_id").
		Order("count DESC").
		Scan(&metrics).Error; err != nil {
		return nil, err
	}

	for _, metric := range metrics {
		entMetric := entities.DefectStateMetrics{
			Status: metric.DefectType,
			Count:  metric.Count,
		}

		byCriticality = append(byCriticality, entMetric)
	}
	return &byCriticality, nil
}
