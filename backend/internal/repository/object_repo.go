package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

var ErrObjectNotFound = fmt.Errorf("object not found")

type AvgObjStat struct {
	ObjectId      uint    `json:"object_id"`
	DefectType    int32   `json:"avg_defect_type"`
	Depth         float32 `json:"avg_depth"`
	Pressure      float32 `json:"avg_pressure"`
	Diameter      int32   `json:"avg_diameter"`
	Age           int32   `json:"avg_age"`
	RmsVibration  float32 `json:"avg_rms_vibration"`
	PeakVibration float32 `json:"avg_peak_vibration"`
	AnomalyScore  float32 `json:"avg_anomaly_score"`
}

type ObjectRepo interface {
	FindNearestEmployees(ctx context.Context, defectId uint, num int) (*[]entities.Employee, error)
	ListEmployees(ctx context.Context, objectId uint) (*[]entities.Employee, error)
	AddObject(ctx context.Context, object *entities.Object) error
	GetObject(ctx context.Context, objectId uint) (*entities.Object, error)
	ListDefects(ctx context.Context, objectId uint) (*[]entities.Defect, error)
	GetProbabilityHistory(ctx context.Context, objectId uint) (*[]entities.MonthlyProbability, error)
	GetAvgStatistics(ctx context.Context, objectId uint) (*AvgObjStat, error)
}

type ObjectRepository struct {
	db *gorm.DB
}

func NewObjectRepository(db *gorm.DB) *ObjectRepository {
	return &ObjectRepository{db: db}
}

func (r *ObjectRepository) GetAvgStatistics(ctx context.Context, objectId uint) (*AvgObjStat, error) {
	var avgStat AvgObjStat

	if err := r.db.WithContext(ctx).Raw(
		`SELECT ROUND(AVG(defect_type_id)) as avg_defect_type,
				ROUND(AVG(depth), 2) as avg_depth,
				ROUND(AVG(pressure), 2) as avg_pressure,
				ROUND(AVG(diameter)) as avg_diameter,
				ROUND(AVG(age)) as avg_age,
				ROUND(AVG(rms_vibration), 2) as avg_rms_vibration,
				ROUND(AVG(anomaly_score), 2) as avg_anomaly_score
		 FROM defects
		 WHERE object_id=?
		`, objectId).Scan(&avgStat).Error; err != nil {
		return nil, err
	}

	return &avgStat, nil
}

func (r *ObjectRepository) FindNearestEmployees(ctx context.Context, objectId uint, num int) (*[]entities.Employee, error) {
	var object models.Object
	if err := r.db.WithContext(ctx).First(&object, objectId).Error; err != nil {
		return nil, err
	}

	var models []models.Employee
	err := r.db.WithContext(ctx).Raw(`
		SELECT *
		FROM employees
		ORDER BY geography<-> ST_SetSRID(ST_MakePoint(?,?),4326)
		LIMIT ?
	`, object.Lon, object.Lat, num).Scan(&models).Error
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

func (r *ObjectRepository) ListEmployees(ctx context.Context, objectId uint) (*[]entities.Employee, error) {
	var models []models.Employee

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var employees []entities.Employee
	for _, model := range models {
		employee := EmployeeToEntity(model)
		employees = append(employees, employee)
	}
	return &employees, nil
}

func (r *ObjectRepository) GetObject(ctx context.Context, objectId uint) (*entities.Object, error) {
	var model models.Object
	if err := r.db.WithContext(ctx).First(&model, "object_id=?", objectId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrObjectNotFound
		}
		return nil, err
	}

	object := ObjectToEntity(model)
	return &object, nil
}

func (r *ObjectRepository) AddObject(ctx context.Context, object *entities.Object) error {
	model := ObjectToModel(*object)

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return err
	}

	return nil
}

func (r *ObjectRepository) ListDefects(ctx context.Context, objectId uint) (*[]entities.Defect, error) {
	var models []models.Defect

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, model := range models {
		defect := DefectToEntity(model)
		defects = append(defects, defect)
	}
	return &defects, nil
}

func (r *ObjectRepository) GetProbabilityHistory(ctx context.Context, objectId uint) (*[]entities.MonthlyProbability, error) {
	var models []entities.MonthlyProbability

	if err := r.db.WithContext(ctx).Raw(`
		SELECT 
    TO_CHAR("timestamp", 'YYYY-MM') as month, 
    AVG(probability) as probability 
	FROM probability_history 
	WHERE object_id = ? 
	GROUP BY TO_CHAR("timestamp", 'YYYY-MM') 
	ORDER BY month ASC;
	`, objectId).Scan(&models).Error; err != nil {
		return nil, err
	}
	return &models, nil
}
