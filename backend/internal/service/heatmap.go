package service

import (
	"context"
	"encoding/json"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/storage"
)

type HeatmapProvider interface {
	BuildHeatMap(ctx context.Context) error
	GetHeatMap(ctx context.Context) (*entities.Heatmap, error)
}

type HeatmapService struct {
	repo  *repository.DefectRepository
	redis *storage.RedisStorage
}

func NewHeatmapService(redis *storage.RedisStorage, repo *repository.DefectRepository) *HeatmapService {
	return &HeatmapService{redis: redis, repo: repo}
}

func (s *HeatmapService) BuildHeatMap(ctx context.Context) error {
	key := "heatmapserv:heatmap"
	heatmap, err := s.repo.PrepareHeatmap(ctx)
	if err != nil {
		return err
	}

	s.redis.Set(ctx, key, heatmap)
	return nil
}

func (s *HeatmapService) GetHeatMap(ctx context.Context) (*entities.Heatmap, error) {
	key := "heatmapserv:heatmap"
	result, err := s.redis.Get(ctx, key)
	if err == nil {
		var heatmap entities.Heatmap
		json.Unmarshal([]byte(result), &heatmap)
		return &heatmap, nil
	}

	err = s.BuildHeatMap(ctx)
	if err != nil {
		return nil, err
	}

	result, err = s.redis.Get(ctx, key)
	if err != nil {
		return nil, err
	}
	var heatmap entities.Heatmap
	json.Unmarshal([]byte(result), &heatmap)
	return &heatmap, nil
}
