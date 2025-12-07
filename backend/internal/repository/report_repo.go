package repository

import (
	"context"
	"time"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

type ReportRepo interface {
	// Для Executive Report
	GetPipelineStats(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) (*entities.ExecutiveStats, error)
	ListDefectsByPipeline(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) (*[]entities.Defect, error)
	GetDefectBreakdown(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) ([]entities.DefectBreakdownRow, error)

	// Для Single Defect Report
	GetDefectWithObjectDetails(ctx context.Context, defectID uint) (*entities.Defect, error)
}

type ReportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

func (r *ReportRepository) GetPipelineStats(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) (*entities.ExecutiveStats, error) {
	var stats entities.ExecutiveStats

	baseQuery := r.db.WithContext(ctx).Model(&models.Defect{}).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ? AND defects.date BETWEEN ? AND ?", pipelineID, dateFrom, dateTo)

	var total int64
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, err
	}
	stats.TotalDefects = int(total)

	// 2. Critical Issues
	// ID 5 = "недопустимо" (Critical)
	var critical int64
	if err := baseQuery.Where("defects.quality_grade_id = ?", 5).Count(&critical).Error; err != nil {
		return nil, err
	}
	stats.CriticalIssues = int(critical)

	// 3. Resolved (Status = 'Solved')
	var resolved int64
	if err := baseQuery.Where("defects.status = ?", "Solved").Count(&resolved).Error; err != nil {
		return nil, err
	}
	stats.Resolved = int(resolved)

	// 4. Diagnostics Count
	var diagnosticsCount int64
	if err := r.db.WithContext(ctx).Model(&models.Diagnostic{}).
		Joins("JOIN objects ON diagnostics.object_id = objects.object_id").
		Where("objects.pipeline_id = ? AND diagnostics.date BETWEEN ? AND ?", pipelineID, dateFrom, dateTo).
		Count(&diagnosticsCount).Error; err != nil {
		return nil, err
	}
	stats.Inspections = int(diagnosticsCount)

	return &stats, nil
}

// ListDefectsByPipeline выгружает список дефектов для передачи в Python (карта + AI)
func (r *ReportRepository) ListDefectsByPipeline(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) (*[]entities.Defect, error) {
	var dbDefects []models.Defect

	err := r.db.WithContext(ctx).
		Joins("JOIN objects ON defects.object_id = objects.object_id").
		Where("objects.pipeline_id = ? AND defects.date BETWEEN ? AND ?", pipelineID, dateFrom, dateTo).
		Preload("DefectType").
		Preload("QualityGrade").
		Preload("Objects").
		Find(&dbDefects).Error

	if err != nil {
		return nil, err
	}

	var defects []entities.Defect
	for _, d := range dbDefects {
		defects = append(defects, DefectToEntity(d))
	}

	return &defects, nil
}

func (r *ReportRepository) GetDefectBreakdown(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) ([]entities.DefectBreakdownRow, error) {
	var results []entities.DefectBreakdownRow

	// Используем SUM(CASE ...) для подсчета по конкретным ID quality_grade_id
	// 5 - Недопустимо (Critical)
	// 4 - Требует мер (High)
	// 7 - Удовлетворительно (Medium)
	// 6 - Допустимо (Low)
	query := `
		SELECT 
			dt.name as defect_type,
			COUNT(*) as count,
			SUM(CASE WHEN d.quality_grade_id = 5 THEN 1 ELSE 0 END) as critical,
			SUM(CASE WHEN d.quality_grade_id = 4 THEN 1 ELSE 0 END) as high,
			SUM(CASE WHEN d.quality_grade_id = 7 THEN 1 ELSE 0 END) as medium,
			SUM(CASE WHEN d.quality_grade_id = 6 THEN 1 ELSE 0 END) as low
		FROM defects d
		JOIN objects o ON d.object_id = o.object_id
		JOIN defect_types dt ON d.defect_type_id = dt.defect_type_id
		WHERE o.pipeline_id = ? AND d.date BETWEEN ? AND ?
		GROUP BY dt.name
		ORDER BY count DESC
	`

	if err := r.db.WithContext(ctx).Raw(query, pipelineID, dateFrom, dateTo).Scan(&results).Error; err != nil {
		return nil, err
	}

	return results, nil
}

// данные по одному дефекту для детального отчета
func (r *ReportRepository) GetDefectWithObjectDetails(ctx context.Context, defectID uint) (*entities.Defect, error) {
	var dbDefect models.Defect

	err := r.db.WithContext(ctx).
		Preload("DefectTypes").
		Preload("Objects").
		Preload("QualityGrades").
		First(&dbDefect, "defect_id = ?", defectID).Error

	if err != nil {
		return nil, err
	}

	entity := DefectToEntity(dbDefect)
	return &entity, nil
}
