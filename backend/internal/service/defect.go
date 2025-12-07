package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/storage"
)

type DefectProvider interface {
	GetPipelineMetrics(ctx context.Context, objectId uint) (*entities.DefectMetrics, error)
	GetDefectInfo(ctx context.Context, defectId uint) (*entities.Defect, error)
	AutoEmployeeAssign(ctx context.Context, defectId uint) (*[]entities.Employee, error)
	DefectsByYears(ctx context.Context, year1, year2, year3, year4, year5 int) (*[]entities.DefectsByYear, error)
	Top5Defects(ctx context.Context) (*[]entities.DefectStateMetrics, error)
	DefectsByCriticality(ctx context.Context) (*[]entities.DefectStateMetrics, error)
}

type DefectService struct {
	repo  *repository.DefectRepository
	redis *storage.RedisStorage
}

func NewDefectService(repo *repository.DefectRepository, redis *storage.RedisStorage) *DefectService {
	return &DefectService{
		repo:  repo,
		redis: redis,
	}
}

func (s *DefectService) GetPipelineMetrics(ctx context.Context, pipelineId uint) (*entities.DefectMetrics, error) {
	key := fmt.Sprintf("defectserv:pipestats:%d", pipelineId)
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var stats entities.DefectMetrics
		json.Unmarshal([]byte(result), &stats)
		return &stats, nil
	}

	var stateMetrics []entities.DefectStateMetrics

	solved, err := s.repo.CountByStatus(ctx, pipelineId, "Solved")
	if err != nil {
		return nil, err
	}
	stateMetrics = append(stateMetrics, entities.DefectStateMetrics{
		Status: "solved",
		Count:  solved.Count,
	})

	created, err := s.repo.CountByStatus(ctx, pipelineId, "Created")
	if err != nil {
		return nil, err
	}
	stateMetrics = append(stateMetrics, entities.DefectStateMetrics{
		Status: "created",
		Count:  created.Count,
	})

	processing, err := s.repo.CountByStatus(ctx, pipelineId, "Processing")
	if err != nil {
		return nil, err
	}
	stateMetrics = append(stateMetrics, entities.DefectStateMetrics{
		Status: "processing",
		Count:  processing.Count,
	})

	avgImp, err := s.repo.GetAvgImportanceByPipeline(ctx, pipelineId)
	if err != nil {
		return nil, err
	}

	metrics := entities.DefectMetrics{
		AvgImp:       avgImp,
		StateMetrics: stateMetrics,
	}

	s.redis.Set(ctx, key, metrics)
	return &metrics, nil
}

func (s *DefectService) AutoEmployeeAssign(ctx context.Context, objId uint, num int) (*[]entities.Employee, error) {
	emps, err := s.repo.FindNearestEmployees(ctx, objId, num)
	if err != nil {
		return nil, err
	}

	var employeeIds []uint
	for _, emp := range *emps {
		id := emp.EmployeeId
		employeeIds = append(employeeIds, id)
	}
	err = s.repo.AssignEmployees(ctx, objId, employeeIds)
	if err != nil {
		return nil, err
	}

	return emps, nil
}

func (s *DefectService) DefectsByYears(ctx context.Context, year1, year2, year3, year4, year5 int) (*[]entities.DefectsByYear, error) {
	key := fmt.Sprintf("defectserv:byyears:%d:%d:%d:%d:%d", year1, year2, year3, year4, year5)
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var stats []entities.DefectsByYear
		json.Unmarshal([]byte(result), &stats)
		return &stats, nil
	}

	var diagnostics []entities.DefectsByYear
	yearI := fmt.Sprintf("%d-01-01", year1)
	yearF := fmt.Sprintf("%d-01-01", year1+1)
	res1, err := s.repo.ListByDate(ctx, yearI, yearF)
	if err != nil {
		return nil, err
	}
	year_1 := entities.DefectsByYear{
		Count: len(*res1),
		Year:  year1,
	}
	diagnostics = append(diagnostics, year_1)

	yearI = fmt.Sprintf("%d-01-01", year2)
	yearF = fmt.Sprintf("%d-01-01", year2+1)
	res2, err := s.repo.ListByDate(ctx, yearI, yearF)
	if err != nil {
		return nil, err
	}
	year_2 := entities.DefectsByYear{
		Count: len(*res2),
		Year:  year2,
	}
	diagnostics = append(diagnostics, year_2)

	yearI = fmt.Sprintf("%d-01-01", year3)
	yearF = fmt.Sprintf("%d-01-01", year3+1)
	res3, err := s.repo.ListByDate(ctx, yearI, yearF)
	if err != nil {
		return nil, err
	}
	year_3 := entities.DefectsByYear{
		Count: len(*res3),
		Year:  year1,
	}
	diagnostics = append(diagnostics, year_3)

	yearI = fmt.Sprintf("%d-01-01", year4)
	yearF = fmt.Sprintf("%d-01-01", year4+1)
	res4, err := s.repo.ListByDate(ctx, yearI, yearF)
	if err != nil {
		return nil, err
	}
	year_4 := entities.DefectsByYear{
		Count: len(*res4),
		Year:  year1,
	}
	diagnostics = append(diagnostics, year_4)

	yearI = fmt.Sprintf("%d-01-01", year5)
	yearF = fmt.Sprintf("%d-01-01", year5+1)
	res5, err := s.repo.ListByDate(ctx, yearI, yearF)
	if err != nil {
		return nil, err
	}
	year_5 := entities.DefectsByYear{
		Count: len(*res5),
		Year:  year5,
	}
	diagnostics = append(diagnostics, year_5)

	s.redis.Set(ctx, key, diagnostics)
	return &diagnostics, nil
}

func (s *DefectService) Top5Defects(ctx context.Context) (*[]entities.DefectStateMetrics, error) {
	key := "defectserv:top5"
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var metrics []entities.DefectStateMetrics
		json.Unmarshal([]byte(result), &metrics)
		return &metrics, nil
	}

	res, err := s.repo.ListImportantTypes(ctx, 5)
	if err != nil {
		return nil, err
	}

	s.redis.Set(ctx, key, res)
	return res, nil
}

func (s *DefectService) DefectsByCriticality(ctx context.Context) (*[]entities.DefectStateMetrics, error) {
	key := "defectserv:byCriticality"
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var metrics []entities.DefectStateMetrics
		json.Unmarshal([]byte(result), &metrics)
		return &metrics, nil
	}

	res, err := s.repo.CountCriticality(ctx)
	if err != nil {
		return nil, err
	}
	s.redis.Set(ctx, key, *res)
	return res, nil
}
