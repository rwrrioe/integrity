package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/storage"
)

type TaskProvider interface {
	GetTaskMetrics(ctx context.Context, objectId uuid.UUID) (*entities.TaskMetrics, error)
}

type TaskService struct {
	repo  repository.TaskRepo
	redis *storage.RedisStorage
}

func NewTaskService(repo repository.TaskRepo, redis *storage.RedisStorage) *TaskService {
	return &TaskService{
		repo:  repo,
		redis: redis,
	}
}

func (s *TaskService) GetTaskMetrics(ctx context.Context, objectId uuid.UUID) (*entities.TaskMetrics, error) {
	var stateMetrics []entities.TaskStateMetrics

	solved, err := s.repo.ListByStatus(ctx, objectId, "Solved")
	if err != nil {
		return nil, err
	}

	created, err := s.repo.ListByStatus(ctx, objectId, "Created")
	if err != nil {
		return nil, err
	}

	processing, err := s.repo.ListByStatus(ctx, objectId, "Processing")
	if err != nil {
		return nil, err
	}

	solvedMetric := entities.TaskStateMetrics{
		Status: "solved",
		Count:  len(*solved),
	}
	stateMetrics = append(stateMetrics, solvedMetric)

	createdMetric := entities.TaskStateMetrics{
		Status: "created",
		Count:  len(*created),
	}
	stateMetrics = append(stateMetrics, createdMetric)

	processingMetric := entities.TaskStateMetrics{
		Status: "processing",
		Count:  len(*processing),
	}
	stateMetrics = append(stateMetrics, processingMetric)

	avgImp, err := s.repo.GetAvgImportance(ctx, objectId)
	if err != nil {
		return nil, err
	}

	metrics := entities.TaskMetrics{
		AvgImp:       avgImp,
		StateMetrics: stateMetrics,
	}

	return &metrics, nil
}
