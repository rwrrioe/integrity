package repository

import (
	"context"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

type PipelineRepo interface {
	ListDefects(ctx context.Context, pipelineId int) (*[]entities.Defect, error)
}

type PipelineRepository struct {
	db *gorm.DB
}

func NewPipelineRepository(db *gorm.DB) *PipelineRepository {
	return &PipelineRepository{db: db}
}

func (r *PipelineRepository) ListDefects(ctx context.Context, pipelineId int) (*[]entities.Defect, error) {
	var models []models.Defect

	if err := r.db.WithContext(ctx).Where("object_id=?", pipelineId).Limit(10).Find(&models).Error; err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, model := range models {
		defect := DefectToEntity(model)
		defects = append(defects, defect)
	}
	return &defects, nil
}
