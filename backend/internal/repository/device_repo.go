package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

var ErrDeviceNotFound = fmt.Errorf("device not found")

type DeviceRepo interface {
	AddDevice(ctx context.Context, device *entities.Device) error
	ListByObject(ctx context.Context, objectId int) (*[]entities.Task, error)
	GetDevice(ctx context.Context, deviceId int) (*entities.Device, error)
}

type DeviceRepository struct {
	db *gorm.DB
}

func (r *DeviceRepository) AddDevice(ctx context.Context, device *entities.Device) error {
	model := DeviceToModel(*device)

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrDeviceNotFound
		}
		return err
	}

	return nil
}

func (r *DeviceRepository) ListByObject(ctx context.Context, objectId int) (*[]entities.Device, error) {
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
