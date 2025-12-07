package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"google.golang.org/genai"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	TotalTargetObjects = 10000
	WorkerCount        = 3
)

const integrityPromptChunk = `
Ты генератор синтетических данных для системы IntegrityOS (Казахстан).
Твоя задача — сгенерировать ОДНУ ПАЧКУ данных. 

Сгенерируй JSON содержащий:
1. **objects**: ровно 20 объектов (трубы, краны, компрессоры).
2. **employees**: 3-5 сотрудников (инженеры, обходчики), которые работают на этом участке.
3. **diagnostics**: 30-40 диагностик для объектов.
4. **defects**: 5-10 дефектов.
5. **sensors**: 5-10 сенсоров.

Справочники:
- Object Types: "crane", "compressor", "pipeline_section"
- Pipelines: "MT-01", "MT-02", "MT-03"
- Roles: "Инженер", "Техник", "Оператор", "Инспектор"
- Methods: "VIK", "PVK", "MPK", "UZK", "RGK", "TVK", "VIBRO"
- Defect Types: "Коррозия", "Трещина", "Вмятина"
- Grades: "удовлетворительно", "допустимо", "требует_мер", "недопустимо"

ВАЖНО:
- Используй "temp_id" (число) для связей.
- Координаты СТРОГО внутри Казахстана.
- Некоторые сотрудники которые привязаны к этому объекту должны быть рядом с ним. Все должны быть до 10км.
- Генерируй диагностику за все 2022, 2021, 2020, 2025 года
- Верни ТОЛЬКО валидный JSON.
`

// 2. ИЗМЕНЕНИЕ: Добавили поле Employees в структуру ответа
type AiResponse struct {
	Objects []struct {
		TempID   int     `json:"temp_id"`
		Name     string  `json:"name"`
		Type     string  `json:"type"`
		Pipeline string  `json:"pipeline"`
		Lat      float64 `json:"lat"`
		Lon      float64 `json:"lon"`
		Material string  `json:"material"`
	} `json:"objects"`

	Employees []struct {
		FirstName string  `json:"first_name"`
		LastName  string  `json:"last_name"`
		Role      string  `json:"role"`
		Lat       float64 `json:"lat"`
		Lon       float64 `json:"lon"`
	} `json:"employees"`

	Diagnostics []struct {
		ObjectTempID int     `json:"object_temp_id"`
		Method       string  `json:"method"`
		Date         string  `json:"date"`
		Temperature  float64 `json:"temperature"`
		Humidity     float64 `json:"humidity"`
		Illumination float64 `json:"illumination"`
	} `json:"diagnostics"`

	Defects []struct {
		ObjectTempID int     `json:"object_temp_id"`
		DefectType   string  `json:"defect_type"`
		Grade        string  `json:"grade"`
		Description  string  `json:"description"`
		Date         string  `json:"date"`
		Width        float64 `json:"width"`
		Length       float64 `json:"length"`
		Depth        float64 `json:"depth"`
		Vibration    float64 `json:"vibration"`
	} `json:"defects"`

	Sensors []struct {
		ObjectTempID int    `json:"object_temp_id"`
		Type         string `json:"type"`
		Name         string `json:"name"`
		Description  string `json:"description"`
	} `json:"sensors"`
}

// ThreadSafeCache для справочников
type ThreadSafeCache struct {
	sync.RWMutex
	Pipelines   map[string]uint
	ObjTypes    map[string]uint
	Methods     map[string]uint
	DefectTypes map[string]uint
	Grades      map[string]uint
	SensorTypes map[string]uint
}

func NewThreadSafeCache() *ThreadSafeCache {
	return &ThreadSafeCache{
		Pipelines:   make(map[string]uint),
		ObjTypes:    make(map[string]uint),
		Methods:     make(map[string]uint),
		DefectTypes: make(map[string]uint),
		Grades:      make(map[string]uint),
		SensorTypes: make(map[string]uint),
	}
}

func DbConnect() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	log.Println("🔄 Running Migrations...")
	err = db.AutoMigrate(
		&models.Pipeline{}, &models.ObjectType{}, &models.Method{},
		&models.DefectType{}, &models.QualityGrade{}, &models.SensorType{}, &models.InspectionType{},
		&models.Object{}, &models.Employee{},
		&models.Diagnostic{}, &models.Defect{}, &models.Sensor{}, &models.Inspection{}, &models.ProbabilityHistory{},
	)
	return db, err
}

func GenerateContent(ctx context.Context, db *gorm.DB, client genai.Client) error {
	// Создаем дефолтного, на всякий случай
	var defaultEmp models.Employee
	empWkt := fmt.Sprintf("SRID=4326;POINT(%f %f)", 67.0, 48.0)
	if err := db.Where("first_name = ? AND last_name = ?", "System", "AI-Generator").FirstOrCreate(&defaultEmp, models.Employee{
		FirstName: "System", LastName: "AI-Generator", RoleId: 1, Lat: 48.0, Lon: 67.0, Geography: empWkt,
	}).Error; err != nil {
		return fmt.Errorf("failed to create default employee: %w", err)
	}
	log.Printf("👷 Default Employee ID: %d", defaultEmp.EmployeeId)

	cache := NewThreadSafeCache()
	var createdCount int64 = 0
	var wg sync.WaitGroup

	startTime := time.Now()
	log.Printf("🚀 Starting %d workers...", WorkerCount)

	for i := 0; i < WorkerCount; i++ {
		wg.Add(1)
		workerID := i + 1

		go func(id int) {
			defer wg.Done()
			for {
				current := atomic.LoadInt64(&createdCount)
				if current >= TotalTargetObjects {
					return
				}

				count, err := processChunk(ctx, db, client, cache, defaultEmp.EmployeeId, id)
				if err != nil {
					log.Printf("Worker %d error: %v (sleeping 10s)", id, err)
					time.Sleep(10 * time.Second)
					continue
				}

				newTotal := atomic.AddInt64(&createdCount, int64(count))
				log.Printf("Worker %d done. Progress: %d/%d", id, newTotal, TotalTargetObjects)

				time.Sleep(5 * time.Second)
			}
		}(workerID)
	}

	wg.Wait()
	log.Printf("✅ Generation Complete! Created %d objects in %v", createdCount, time.Since(startTime))
	return nil
}

func processChunk(ctx context.Context, db *gorm.DB, client genai.Client, cache *ThreadSafeCache, defaultEmpID uint, workerID int) (int, error) {
	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   getSchema(),
	}

	resp, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash-lite", genai.Text(integrityPromptChunk), config)
	if err != nil {
		return 0, err
	}

	var aiResp AiResponse
	if err := json.Unmarshal([]byte(resp.Text()), &aiResp); err != nil {
		return 0, err
	}
	if len(aiResp.Objects) == 0 {
		return 0, nil
	}

	tx := db.Begin()
	if tx.Error != nil {
		return 0, tx.Error
	}

	// --- Helpers with Locking ---
	getPipelineID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.Pipelines[name]; ok {
			return id, nil
		}
		var m models.Pipeline
		if err := tx.Where("name = ?", name).FirstOrCreate(&m, models.Pipeline{Name: name}).Error; err != nil {
			return 0, err
		}
		cache.Pipelines[name] = m.PipelineId
		return m.PipelineId, nil
	}
	getObjTypeID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.ObjTypes[name]; ok {
			return id, nil
		}
		var m models.ObjectType
		if err := tx.FirstOrCreate(&m, models.ObjectType{ObjectTypeName: name}).Error; err != nil {
			return 0, err
		}
		cache.ObjTypes[name] = m.ObjectTypeId
		return m.ObjectTypeId, nil
	}
	getMethodID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.Methods[name]; ok {
			return id, nil
		}
		var m models.Method
		if err := tx.FirstOrCreate(&m, models.Method{MethodName: name}).Error; err != nil {
			return 0, err
		}
		cache.Methods[name] = m.MethodId
		return m.MethodId, nil
	}
	getDefectTypeID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.DefectTypes[name]; ok {
			return id, nil
		}
		var m models.DefectType
		if err := tx.FirstOrCreate(&m, models.DefectType{Name: name}).Error; err != nil {
			return 0, err
		}
		cache.DefectTypes[name] = m.DefectTypeId
		return m.DefectTypeId, nil
	}
	getGradeID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.Grades[name]; ok {
			return id, nil
		}
		var m models.QualityGrade
		if err := tx.FirstOrCreate(&m, models.QualityGrade{QualityGrade: name}).Error; err != nil {
			return 0, err
		}
		cache.Grades[name] = m.QualityGradeId
		return m.QualityGradeId, nil
	}
	getSensorTypeID := func(name string) (uint, error) {
		cache.Lock()
		defer cache.Unlock()
		if id, ok := cache.SensorTypes[name]; ok {
			return id, nil
		}
		var m models.SensorType
		if err := tx.FirstOrCreate(&m, models.SensorType{Name: name}).Error; err != nil {
			return 0, err
		}
		cache.SensorTypes[name] = m.SensorTypeId
		return m.SensorTypeId, nil
	}

	// 1. Вставка Объектов
	var objectsBatch []models.Object
	var tempIdsOrder []int
	for _, objData := range aiResp.Objects {
		tID, _ := getObjTypeID(objData.Type)
		pID, _ := getPipelineID(objData.Pipeline)
		wktLocation := fmt.Sprintf("SRID=4326;POINT(%f %f)", objData.Lon, objData.Lat)
		objectsBatch = append(objectsBatch, models.Object{
			ObjectName: objData.Name, ObjectTypeId: tID, PipelineId: pID,
			Lat: objData.Lat, Lon: objData.Lon, Material: objData.Material, Location: wktLocation,
		})
		tempIdsOrder = append(tempIdsOrder, objData.TempID)
	}
	if err := tx.Create(&objectsBatch).Error; err != nil {
		tx.Rollback()
		return 0, err
	}

	tempIdToRealId := make(map[int]uint)
	realIdToObject := make(map[uint]models.Object)
	for i, savedObj := range objectsBatch {
		tempIdToRealId[tempIdsOrder[i]] = savedObj.ObjectId
		realIdToObject[savedObj.ObjectId] = savedObj
	}

	// 2. ИЗМЕНЕНИЕ: Вставка Сотрудников (Новая логика)
	var generatedEmpIDs []uint
	var employeesBatch []models.Employee

	// Простая мапа ролей в ID (или можно через FirstOrCreate как другие справочники)
	roleMap := map[string]uint{"Инженер": 1, "Техник": 2, "Оператор": 3, "Инспектор": 4}

	for _, empData := range aiResp.Employees {
		roleID := roleMap[empData.Role]
		if roleID == 0 {
			roleID = 1
		} // fallback

		wkt := fmt.Sprintf("SRID=4326;POINT(%f %f)", empData.Lon, empData.Lat)
		employeesBatch = append(employeesBatch, models.Employee{
			FirstName: empData.FirstName, LastName: empData.LastName, RoleId: roleID,
			Lat: empData.Lat, Lon: empData.Lon, Geography: wkt,
		})
	}

	// Если ИИ сгенерировал сотрудников, сохраняем их
	if len(employeesBatch) > 0 {
		if err := tx.Create(&employeesBatch).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
		// Собираем их ID
		for _, e := range employeesBatch {
			generatedEmpIDs = append(generatedEmpIDs, e.EmployeeId)
		}
	} else {
		// Если вдруг не сгенерировал - используем дефолтного
		generatedEmpIDs = append(generatedEmpIDs, defaultEmpID)
	}

	// 3. Диагностики
	var diagBatch []models.Diagnostic
	for _, d := range aiResp.Diagnostics {
		if rid, ok := tempIdToRealId[d.ObjectTempID]; ok {
			mID, _ := getMethodID(d.Method)
			dt, _ := time.Parse(time.RFC3339, d.Date)
			diagBatch = append(diagBatch, models.Diagnostic{
				ObjectId: rid, MethodId: mID, Date: dt,
				Temperature: d.Temperature, Humidity: d.Humidity, Illumination: d.Illumination,
			})
		}
	}
	if len(diagBatch) > 0 {
		if err := tx.Create(&diagBatch).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	// 4. Дефекты (Случайный выбор сотрудника из сгенерированных)
	var defectBatch []models.Defect
	for _, d := range aiResp.Defects {
		if rid, ok := tempIdToRealId[d.ObjectTempID]; ok {
			dtID, _ := getDefectTypeID(d.DefectType)
			gID, _ := getGradeID(d.Grade)
			dt, _ := time.Parse(time.RFC3339, d.Date)
			parent := realIdToObject[rid]
			wkt := fmt.Sprintf("SRID=4326;POINT(%f %f)", parent.Lon, parent.Lat)

			// Выбираем случайного сотрудника из этой пачки
			randomEmpID := generatedEmpIDs[rand.Intn(len(generatedEmpIDs))]

			defectBatch = append(defectBatch, models.Defect{
				ObjectId: rid, DefectTypeId: dtID, QualityGradeId: gID,
				EmployeeId:  randomEmpID, // Привязываем к рандомному сотруднику
				Description: d.Description, Status: "Open", Date: dt,
				Width: d.Width, Length: d.Length, Depth: d.Depth, Vibration: d.Vibration,
				Lat: parent.Lat, Lon: parent.Lon, Location: wkt,
			})
		}
	}
	if len(defectBatch) > 0 {
		if err := tx.Create(&defectBatch).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	// 5. Сенсоры
	var sensorBatch []models.Sensor
	for _, s := range aiResp.Sensors {
		if rid, ok := tempIdToRealId[s.ObjectTempID]; ok {
			stID, _ := getSensorTypeID(s.Type)
			sensorBatch = append(sensorBatch, models.Sensor{
				SensorId: uuid.New(), ObjectId: rid, SensorTypeId: stID,
				Name: s.Name, Description: s.Description,
			})
		}
	}
	if len(sensorBatch) > 0 {
		if err := tx.Create(&sensorBatch).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return 0, err
	}
	return len(objectsBatch), nil
}

// 3. ИЗМЕНЕНИЕ: Добавили employees в схему
func getSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"objects": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"temp_id":  {Type: genai.TypeInteger},
						"name":     {Type: genai.TypeString},
						"type":     {Type: genai.TypeString},
						"pipeline": {Type: genai.TypeString},
						"material": {Type: genai.TypeString},
						"lat":      {Type: genai.TypeNumber},
						"lon":      {Type: genai.TypeNumber},
						"year":     {Type: genai.TypeInteger},
					},
					Required: []string{"temp_id", "name", "type", "pipeline", "lat", "lon"},
				},
			},
			"employees": { // Новая секция
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"first_name": {Type: genai.TypeString},
						"last_name":  {Type: genai.TypeString},
						"role":       {Type: genai.TypeString},
						"lat":        {Type: genai.TypeNumber},
						"lon":        {Type: genai.TypeNumber},
					},
				},
			},
			"diagnostics": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"object_temp_id": {Type: genai.TypeInteger},
						"method":         {Type: genai.TypeString},
						"date":           {Type: genai.TypeString},
						"temperature":    {Type: genai.TypeNumber},
						"humidity":       {Type: genai.TypeNumber},
						"illumination":   {Type: genai.TypeNumber},
					},
					Required: []string{"object_temp_id", "method", "date"},
				},
			},
			"defects": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"object_temp_id": {Type: genai.TypeInteger},
						"defect_type":    {Type: genai.TypeString},
						"grade":          {Type: genai.TypeString},
						"description":    {Type: genai.TypeString},
						"date":           {Type: genai.TypeString},
						"width":          {Type: genai.TypeNumber},
						"length":         {Type: genai.TypeNumber},
						"depth":          {Type: genai.TypeNumber},
						"vibration":      {Type: genai.TypeNumber},
					},
					Required: []string{"object_temp_id", "defect_type"},
				},
			},
			"sensors": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"object_temp_id": {Type: genai.TypeInteger},
						"type":           {Type: genai.TypeString},
						"name":           {Type: genai.TypeString},
						"description":    {Type: genai.TypeString},
					},
				},
			},
		},
		Required: []string{"objects", "employees", "diagnostics", "defects"},
	}
}
