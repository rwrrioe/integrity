package service

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"github.com/rwrrioe/integrity/backend/internal/storage"
	"gorm.io/gorm"
)

type SCVParser struct {
	redis storage.RedisStorage
	db    *gorm.DB
}

func NewScvParser(redis storage.RedisStorage, db *gorm.DB) *SCVParser {
	return &SCVParser{redis: redis, db: db}
}

// --- Хелперы ---

func parseFloat(s string) float64 {
	f, err := strconv.ParseFloat(strings.TrimSpace(s), 64)
	if err != nil {
		return 0.0
	}
	return f
}

func parseUint(s string) uint {
	i, err := strconv.ParseUint(strings.TrimSpace(s), 10, 64)
	if err != nil {
		return 0
	}
	return uint(i)
}

func parseBool(s string) bool {
	b, err := strconv.ParseBool(strings.TrimSpace(s))
	if err != nil {
		return false
	}
	return b
}

func parseDate(s string) time.Time {
	layout := "2006-01-02"
	// Иногда CSV может содержать время, стоит проверить или использовать более гибкий парсер
	t, err := time.Parse(layout, strings.TrimSpace(s))
	if err != nil {
		// Попытка спасти ситуацию, если формат не совпал, или вернуть текущую
		return time.Now()
	}
	return t
}

func formatGeoPoint(lat, lon float64) string {
	return fmt.Sprintf("ST_MakePoint(%f,%f),4326", lon, lat)
}

// --- Импорт Объектов (из Redis) ---

// ImportObjects принимает ключ Redis (или ID для формирования ключа), достает CSV строку и парсит её
func (s *SCVParser) ImportObjects(ctx context.Context, redisKey string) error {
	// 1. Получаем данные из Redis (предполагаем, что там лежит содержимое CSV файла как строка)
	csvContent, err := s.redis.Get(ctx, redisKey)
	if err != nil {
		return fmt.Errorf("failed to get csv from redis: %w", err)
	}

	// 2. Создаем Reader из строки
	reader := csv.NewReader(strings.NewReader(csvContent))

	// Пропускаем заголовок
	if _, err := reader.Read(); err != nil {
		return err
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Ошибка чтения строки CSV объектов: %v", err)
			continue
		}

		// record[0]: object_id, record[1]: object_name, ...
		objID := parseUint(record[0])
		objName := record[1]
		typeName := record[2]
		pipelineName := record[3]
		lat := parseFloat(record[4])
		lon := parseFloat(record[5])
		// year := record[6]
		material := record[7]

		// Логика БД
		var objType models.ObjectType
		if err := s.db.FirstOrCreate(&objType, models.ObjectType{ObjectTypeName: typeName}).Error; err != nil {
			log.Printf("Ошибка создания типа объекта: %v", err)
			continue
		}

		var pipeline models.Pipeline
		if err := s.db.FirstOrCreate(&pipeline, models.Pipeline{Name: pipelineName}).Error; err != nil {
			log.Printf("Ошибка создания пайплайна: %v", err)
			continue
		}

		object := models.Object{
			ObjectId:     objID,
			ObjectName:   objName,
			ObjectTypeId: objType.ObjectTypeId,
			PipelineId:   pipeline.PipelineId,
			Lat:          lat,
			Lon:          lon,
			Location:     formatGeoPoint(lat, lon),
			Material:     material,
		}

		if err := s.db.Save(&object).Error; err != nil {
			log.Printf("Ошибка сохранения объекта %d: %v", objID, err)
		}
	}

	return nil
}

// --- Импорт Диагностики и Дефектов (из Redis) ---

func (s *SCVParser) ImportDiagnostics(ctx context.Context, redisKey string) error {
	// 1. Получаем данные
	csvContent, err := s.redis.Get(ctx, redisKey)
	if err != nil {
		return fmt.Errorf("failed to get diagnostics csv from redis: %w", err)
	}

	// 2. Создаем Reader
	reader := csv.NewReader(strings.NewReader(csvContent))

	if _, err := reader.Read(); err != nil {
		return err
	}

	// Кэшируем дефолтный тип дефекта
	var defaultDefectType models.DefectType
	s.db.FirstOrCreate(&defaultDefectType, models.DefectType{Name: "General"})

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Ошибка чтения строки CSV диагностики: %v", err)
			continue
		}

		objID := parseUint(record[1])
		methodName := record[2]
		dateVal := parseDate(record[3])
		temp := parseFloat(record[4])
		hum := parseFloat(record[5])
		illum := parseFloat(record[6])
		hasDefect := parseBool(record[7])
		defDesc := record[8]
		qGradeName := record[9]
		param1 := parseFloat(record[10])
		param2 := parseFloat(record[11])
		mlLabel := record[13]

		// 1. Method
		var method models.Method
		s.db.FirstOrCreate(&method, models.Method{MethodName: methodName})

		// 2. Diagnostic
		diagnostic := models.Diagnostic{
			ObjectId:     objID,
			MethodId:     method.MethodId,
			Date:         dateVal,
			Temperature:  temp,
			Humidity:     hum,
			Illumination: illum,
		}

		// Обращаемся к s.db
		if err := s.db.Create(&diagnostic).Error; err != nil {
			log.Printf("Ошибка сохранения диагностики для объекта %d: %v", objID, err)
			continue
		}

		// 3. ProbabilityHistory
		var prob float64
		switch mlLabel {
		case "normal":
			prob = 0.0
		case "medium":
			prob = 0.5
		case "high":
			prob = 1.0
		}

		probHistory := models.ProbabilityHistory{
			ObjectId:    objID,
			Probability: prob,
			Timestamp:   &dateVal,
		}
		s.db.Create(&probHistory)

		// 4. Defect
		if hasDefect {
			var qGrade models.QualityGrade
			s.db.FirstOrCreate(&qGrade, models.QualityGrade{QualityGrade: qGradeName})

			// Ищем координаты родительского объекта
			var parentObj models.Object
			if err := s.db.Select("Lat", "Lon").First(&parentObj, objID).Error; err == nil {

				defect := models.Defect{
					ObjectId:       objID,
					DefectTypeId:   defaultDefectType.DefectTypeId,
					QualityGradeId: qGrade.QualityGradeId, // Исправлено: QualityGradeIdId -> QualityGradeId
					Description:    defDesc,
					Status:         "New",
					Date:           dateVal,
					Depth:          param1,
					Vibration:      param2,
					Lat:            parentObj.Lat,
					Lon:            parentObj.Lon,
					Location:       formatGeoPoint(parentObj.Lat, parentObj.Lon),
				}

				if err := s.db.Create(&defect).Error; err != nil {
					log.Printf("Ошибка сохранения дефекта: %v", err)
				}
			} else {
				log.Printf("Не удалось найти объект %d для привязки координат дефекта", objID)
			}
		}
	}

	return nil
}
