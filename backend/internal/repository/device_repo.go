package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

var ErrDeviceNotFound = fmt.Errorf("device not found")

type DeviceRepo interface {
	AddDevice(ctx context.Context, device *entities.Device) error
	ListByObject(ctx context.Context, objectId uuid.UUID) (*[]entities.Device, error)
	GetDevice(ctx context.Context, deviceId uuid.UUID) (*entities.Device, error)
	ListByStatus(ctx context.Context, objectId uuid.UUID, status string) (*[]entities.Device, error)
	GetAvgCondition(ctx context.Context, objectId uuid.UUID) (float64, error)
}

type DeviceRepository struct {
	db *gorm.DB
}

func NewDeviceRepo(db *gorm.DB) *DeviceRepository {
	return &DeviceRepository{db: db}
}

func (r *DeviceRepository) AddDevice(ctx context.Context, device *entities.Device) error {
	model := DeviceToModel(*device)

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return err
	}

	return nil
}

func (r *DeviceRepository) ListByObject(ctx context.Context, objectId uuid.UUID) (*[]entities.Device, error) {
	var models []models.Device

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Find(&models).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDeviceNotFound
		}
		return nil, err
	}

	var devices []entities.Device
	for _, model := range models {
		device := DeviceToEntity(model)
		devices = append(devices, device)
	}
	return &devices, nil
}

func (r *DeviceRepository) GetDevice(ctx context.Context, deviceId uuid.UUID) (*entities.Device, error) {
	var model models.Device

	if err := r.db.WithContext(ctx).First(&model, "device_id=?", deviceId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDeviceNotFound
		}
		return nil, err
	}

	device := DeviceToEntity(model)
	return &device, nil
}

func (r *DeviceRepository) ListByStatus(ctx context.Context, objectId uuid.UUID, status string) (*[]entities.Device, error) {
	var models []models.Device

	if err := r.db.WithContext(ctx).Where("status=? AND object_id=?", status, objectId).Find(&models).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDeviceNotFound
		}
		return nil, err
	}

	var devices []entities.Device
	for _, model := range models {
		device := DeviceToEntity(model)
		devices = append(devices, device)
	}
	return &devices, nil
}

func (r *DeviceRepository) GetAvgCondition(ctx context.Context, objectId uuid.UUID) (float64, error) {
	var avgCond float64

	if err := r.db.Select("EOUND(AVG(condition),2)").Where("object_id=?", objectId).Table("devices").Find(&avgCond).Error; err != nil {
		return 0.0, err
	}
	return avgCond, nil
}
