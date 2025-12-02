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

var ErrObjectNotFound = fmt.Errorf("object not found")

type ObjectRepo interface {
	AddObject(ctx context.Context, object *entities.Object) error
	GetObject(ctx context.Context, objectId uuid.UUID) (*entities.Object, error)
}

type ObjectRepository struct {
	db *gorm.DB
}

func (r *ObjectRepository) GetObject(ctx context.Context, objectId uuid.UUID) (*entities.Object, error) {
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
