package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/storage"
)

type InspectionProvider interface {
	InspectionsByYears(ctx context.Context, year1, year2, year3 int) (*[]entities.DiagnosticByYear, error)
}
type InspectionService struct {
	repo  *repository.DiagnosticRepository
	redis *storage.RedisStorage
}

func NewInspectionService(repo *repository.DiagnosticRepository, redis *storage.RedisStorage) *InspectionService {
	return &InspectionService{
		repo:  repo,
		redis: redis,
	}
}
func (s InspectionService) InspectionsByYears(ctx context.Context, year1, year2, year3 int) (*[]entities.DiagnosticByYear, error) {
	key := fmt.Sprintf("inspectserv:byyears:%d:%d:%d", year1, year2, year3)
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var stats []entities.DiagnosticByYear
		json.Unmarshal([]byte(result), &stats)
		return &stats, nil
	}

	var diagnostics []entities.DiagnosticByYear
	res1, err := s.repo.ListByYear(ctx, year1)
	if err != nil {
		return nil, err
	}
	year_1 := entities.DiagnosticByYear{
		Count: len(*res1),
		Year:  year1,
	}
	diagnostics = append(diagnostics, year_1)

	res2, err := s.repo.ListByYear(ctx, year2)
	if err != nil {
		return nil, err
	}
	year_2 := entities.DiagnosticByYear{
		Count: len(*res2),
		Year:  year1,
	}
	diagnostics = append(diagnostics, year_2)

	res3, err := s.repo.ListByYear(ctx, year3)
	if err != nil {
		return nil, err
	}
	year_3 := entities.DiagnosticByYear{
		Count: len(*res3),
		Year:  year3,
	}
	diagnostics = append(diagnostics, year_3)

	s.redis.Set(ctx, key, diagnostics)
	return &diagnostics, nil
}
func (s InspectionService) InspectionsByMethods(ctx context.Context, methodIds []int) (*[]entities.DiagnosticByMethod, error) {
	var metrics []entities.DiagnosticByMethod
	for _, method := range methodIds {
		metric, err := s.repo.CountByType(ctx, uint(method))
		if err != nil {
			return nil, err
		}

		metrics = append(metrics, *metric)
	}

	return &metrics, nil
}
