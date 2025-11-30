package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/domain/requests"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/storage"
	"google.golang.org/genai"
)

type DeviceProvider interface {
	AddDevice(ctx context.Context, req *requests.CreateDeviceRequest) error
	GetDevice(ctx context.Context, deviceId int) (*entities.Device, error)
	ListDevices(ctx context.Context, objectId int) (*[]entities.Device, error)
	UpdateDevice(ctx context.Context, req *requests.UpdateDeviceRequest) error
	GetAnalytics(ctx context.Context, deviceId int) (*entities.DeviceAnalytics, error)
}

type DeviceService struct {
	repo   repository.DeviceRepo
	redis  *storage.RedisStorage
	client *genai.Client
	model  string
}

func NewDeviceService(ctx context.Context, repo repository.DeviceRepo, storage *storage.RedisStorage, model string) (*DeviceService, error) {
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, err
	}

	return &DeviceService{
		repo:   repo,
		redis:  storage,
		client: client,
		model:  model,
	}, nil
}

const defaultPrompt string = `
Ты профессиональный инженер и специалист по промышленному оборудованию и промышленной безопасности. Тебе предоставлена информация об устройстве на промышленном предприятии.
На основе этой информации дай короткую сводку с рекомендацией. По типу:
 "Cостояние устройства ниже допустимого порога.
  Последнее обслуживание было 4+ месяцев назад.
  
  Рекомендуется провести диагностику в ближайшие 7–10 дней,
  чтобы избежать ухудшения состояния."
Информация: %b`

func (s *DeviceService) AddDevice(ctx context.Context, req *requests.CreateDeviceRequest) error {
	device := entities.Device{
		Name:        req.Name,
		Description: req.Description,
		Status:      req.Status,
		Condition:   req.Condition,
	}

	err := s.repo.AddDevice(ctx, &device)
	if err != nil {
		return err
	}

	return nil
}

func (s *DeviceService) GetDevice(ctx context.Context, deviceId int) (*entities.Device, error) {
	device, err := s.repo.GetDevice(ctx, deviceId)
	if err != nil {
		return nil, err
	}

	return device, nil
}

func (s *DeviceService) GetAnalytics(ctx context.Context, deviceId int) (*entities.DeviceAnalytics, error) {
	var analytics entities.DeviceAnalytics
	key := fmt.Sprintf("device:analytics:%d", deviceId)
	res, err := s.redis.Get(ctx, key)
	if err == nil {
		json.Unmarshal([]byte(res), &analytics)
		return &analytics, nil
	}

	device, err := s.repo.GetDevice(ctx, deviceId)
	if err != nil {
		return nil, err
	}

	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"device_id": {Type: genai.TypeNumber},
				"analytics": {Type: genai.TypeString},
			},
			Required: []string{"device_id", "analytics"},
		},
	}
	b, err := json.MarshalIndent(device, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to serialize device struct")
	}

	prompt := fmt.Sprintf(defaultPrompt, b)
	result, err := s.client.Models.GenerateContent(ctx,
		s.model,
		genai.Text(prompt),
		config,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate AI response:%w", err)
	}

	if err := json.Unmarshal([]byte(result.Text()), &analytics); err != nil {
		return nil, fmt.Errorf("failed to unmarshal AI response: %w", err)
	}

	if err := s.redis.Set(ctx, key, analytics); err != nil {
		return nil, err
	}
	
	return &analytics, nil
}
