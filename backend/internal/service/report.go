package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/pkg/generators"
	pb "github.com/rwrrioe/integrity_protos/gen/go/reportsv2"
)

type ReportService struct {
	repo     repository.ReportRepo
	pyClient pb.AnalyticsServiceClient
	pdfGen   *generators.PDFGenerator
}

func NewReportService(repo repository.ReportRepo, pyClient pb.AnalyticsServiceClient, pdfGen *generators.PDFGenerator) *ReportService {
	return &ReportService{
		repo:     repo,
		pyClient: pyClient,
		pdfGen:   pdfGen,
	}
}

// --- 1. EXECUTIVE REPORT ---

func (s *ReportService) GetExecutiveReport(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) (*entities.ExecutiveReport, error) {
	// 1. Получение статистики (Total, Critical, Resolved, Inspections)
	stats, err := s.repo.GetPipelineStats(ctx, pipelineID, dateFrom, dateTo)
	if err != nil {
		return nil, fmt.Errorf("failed to get pipeline stats: %w", err)
	}

	// 2. Получение списка дефектов (для карты и AI анализа)
	// Важно: здесь мы получаем *defects, в repository возвращается указатель на слайс
	defectsPtr, err := s.repo.ListDefectsByPipeline(ctx, pipelineID, dateFrom, dateTo)
	if err != nil {
		return nil, fmt.Errorf("failed to list defects: %w", err)
	}
	defects := *defectsPtr // Разыменовываем для удобства

	// 3. Получение разбивки по типам (Breakdown) через SQL
	// Это эффективнее, чем считать вручную в Go цикле
	breakdown, err := s.repo.GetDefectBreakdown(ctx, pipelineID, dateFrom, dateTo)
	if err != nil {
		return nil, fmt.Errorf("failed to get defect breakdown: %w", err)
	}

	// 4. Подготовка данных и вызов Python (AI Analysis)
	// TODO: Получить реальное имя трубопровода из БД через отдельный метод репозитория
	pipelineName := "Water Supply Network C"

	grpcDefects := s.mapDefectsToProto(defects)

	pyResp, err := s.pyClient.GenerateExecutiveAnalytics(ctx, &pb.ExecutiveRequest{
		PipelineName: pipelineName,
		Defects:      grpcDefects,
	})
	if err != nil {
		// Решение: возвращаем ошибку или логируем и возвращаем отчет без AI части.
		// Сейчас возвращаем ошибку.
		return nil, fmt.Errorf("analytics service error: %w", err)
	}

	// 5. Маппинг рекомендаций из gRPC в сущности
	var recommendations []entities.Recommendation
	if pyResp.Recommendations != nil {
		for _, r := range pyResp.Recommendations {
			recommendations = append(recommendations, entities.Recommendation{
				Priority:    r.Priority,
				Title:       r.Title,
				Description: r.Description,
			})
		}
	}

	// 6. Сборка финального отчета
	report := &entities.ExecutiveReport{
		PipelineName:    pipelineName,
		GeneratedAt:     time.Now().Format("2006-01-02"),
		Stats:           *stats, // stats возвращается как pointer из repo
		KeyFindings:     pyResp.KeyFindings,
		MapImageBase64:  base64.StdEncoding.EncodeToString(pyResp.MapImage),
		Breakdown:       breakdown,
		Recommendations: recommendations,
	}

	return report, nil
}

// --- 2. SINGLE DEFECT REPORT ---

func (s *ReportService) GetSingleDefectReport(ctx context.Context, defectID uint) (*entities.SingleDefectReport, error) {
	// 1. Получение данных из БД
	d, err := s.repo.GetDefectWithObjectDetails(ctx, defectID)
	if err != nil {
		return nil, fmt.Errorf("defect not found: %w", err)
	}

	// 2. Вызов Python AI
	pyResp, err := s.pyClient.GenerateDefectAnalytics(ctx, &pb.DefectRequest{
		DefectType: d.DefectType,
		Depth:      d.Depth,
		Pressure:   float64(d.Pressure),
		Diameter:   float64(d.Diameter),
		Lat:        d.Lat,
		Lon:        d.Lon,
		Age:        float64(d.Age),
	})
	if err != nil {
		return nil, fmt.Errorf("analytics service error: %w", err)
	}

	// 3. Сборка отчета
	report := &entities.SingleDefectReport{
		DefectID: d.DefectId,
		Type:     d.DefectType,
		Metrics: entities.DefectReportMetrics{
			Depth:    d.Depth,
			Pressure: float64(d.Pressure),
			Age:      int(d.Age),
		},
		LlmSolution:    pyResp.LlmAnalysis,
		MapImageBase64: base64.StdEncoding.EncodeToString(pyResp.MapImage),
	}

	return report, nil
}

// --- PDF GENERATION ---

func (s *ReportService) GenerateExecutivePDF(ctx context.Context, pipelineID uint, dateFrom, dateTo time.Time) ([]byte, error) {
	data, err := s.GetExecutiveReport(ctx, pipelineID, dateFrom, dateTo)
	if err != nil {
		return nil, err
	}
	return s.pdfGen.GenerateExecutive(data)
}

func (s *ReportService) GenerateDefectAnalysisPDF(ctx context.Context, defectId uint) ([]byte, error) {
	data, err := s.GetSingleDefectReport(ctx, defectId)
	if err != nil {
		return nil, err
	}
	return s.pdfGen.GenerateSingleDefect(data)
}

func (s *ReportService) mapDefectsToProto(defects []entities.Defect) []*pb.DefectSummary {
	grpcDefects := make([]*pb.DefectSummary, 0, len(defects))
	for _, d := range defects {
		grpcDefects = append(grpcDefects, &pb.DefectSummary{
			Type:     d.DefectType,
			Severity: d.QualityGrade,
			Lat:      d.Lat,
			Lon:      d.Lon,
		})
	}
	return grpcDefects
}
