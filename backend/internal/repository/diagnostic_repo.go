package repository

import (
	"context"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

type DiagnosticRepo interface {
	AddDiagnostic(ctx context.Context, diagnostic entities.Diagnostic) error
	ListByObject(ctx context.Context, objectId uint) (*[]entities.Diagnostic, error)
	ListByYear(ctx context.Context, year int) (*[]entities.Diagnostic, error)
	CountByType(ctx context.Context, defectTypeId int) (*entities.DiagnosticByMethod, error)
}

type DiagnosticRepository struct {
	db *gorm.DB
}

func NewDiagnosticRepository(db *gorm.DB) *DiagnosticRepository {
	return &DiagnosticRepository{db: db}
}

func (r *DiagnosticRepository) AddDiagnostic(ctx context.Context, diagnostic entities.Diagnostic) error {
	var model models.Diagnostic

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		return err
	}

	return nil
}

func (r *DiagnosticRepository) ListByObject(ctx context.Context, objectId uint) (*[]entities.Diagnostic, error) {
	var models []models.Diagnostic

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Find(&models).Error; err != nil {
		return nil, err
	}

	var diagnostics []entities.Diagnostic
	for _, model := range models {
		diagnostic := DiagnosticToEntity(model)
		diagnostics = append(diagnostics, diagnostic)
	}
	return &diagnostics, nil
}

func (r *DiagnosticRepository) ListByYear(ctx context.Context, year int) (*[]entities.Diagnostic, error) {
	var models []models.Diagnostic

	if err := r.db.WithContext(ctx).Where("date >%d-01-01 00:00:00+02", year).Find(&models).Error; err != nil {
		return nil, err
	}

	var diagnostics []entities.Diagnostic
	for _, model := range models {
		diagnostic := DiagnosticToEntity(model)
		diagnostics = append(diagnostics, diagnostic)
	}
	return &diagnostics, nil
}

func (r *DiagnosticRepository) CountByType(ctx context.Context, defectTypeId uint) (*entities.DiagnosticByMethod, error) {
	var metric entities.DiagnosticByMethod

	if err := r.db.WithContext(ctx).Table("diagnostics").
		Select("method_id, COUNT(*) as count").
		Where("method_id=?", defectTypeId).
		Group("method_id").
		Scan(&metric).Error; err != nil {
		return nil, err
	}
	return &metric, nil
}
