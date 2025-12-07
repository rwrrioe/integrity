package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

type SensorRepo interface {
	GetSensor(ctx context.Context, sensorId uuid.UUID) (*entities.Sensor, error)
	AddSensor(ctx context.Context, sensor *entities.Sensor) error
	GetSensorObject(ctx context.Context, objectId uint) (*entities.Sensor, error)
	ListByObject(ctx context.Context, objectId uint) (*[]entities.Sensor, error)
}

type SensorRepository struct {
	db *gorm.DB
}

func NewSensorRepository(db *gorm.DB) *SensorRepository {
	return &SensorRepository{db: db}
}

func (r *SensorRepository) GetSensor(ctx context.Context, sensorId uuid.UUID) (*entities.Sensor, error) {
	var model models.Sensor

	if err := r.db.WithContext(ctx).First(&model, "sensor_id=?", sensorId).Error; err != nil {
		return nil, err
	}

	sensor := SensorToEntity(model)
	return &sensor, nil
}

func (r *SensorRepository) AddSensor(ctx context.Context, sensor *entities.Sensor) error {
	model := SensorToModel(*sensor)

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return err
	}
	return nil
}

func (r *SensorRepository) GetSensorObject(ctx context.Context, objectId uint) (*entities.Sensor, error) {
	var model models.Sensor

	if err := r.db.WithContext(ctx).Where("device_id=?", objectId).Preload("SensorTypes").Find(&model).Error; err != nil {
		return nil, err
	}

	sensor := SensorToEntity(model)

	return &sensor, nil
}

func (r *SensorRepository) ListByObject(ctx context.Context, objectId uint) (*[]entities.Sensor, error) {
	var models []models.Sensor

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Find(&models).Error; err != nil {
		return nil, err
	}
	var sensors []entities.Sensor
	for _, model := range models {
		sensor := SensorToEntity(model)
		sensors = append(sensors, sensor)
	}
	return &sensors, nil
}
