package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	mqtt_sensors "github.com/rwrrioe/integrity/backend/internal/clients/sensors/mqtt"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/storage"
)

type IngestionProvider interface {
	StartBatchProcessing(ctx context.Context)
}

type IngestionService struct {
	storage   *storage.RedisStorage
	payloadCh <-chan mqtt_sensors.SensorPayload
	batchSize int
	batchTime time.Duration
}

func NewIngestionService(storage *storage.RedisStorage, payload <-chan mqtt_sensors.SensorPayload, batchSize int, batchTime time.Duration) *IngestionService {
	return &IngestionService{
		storage:   storage,
		payloadCh: payload,
		batchSize: batchSize,
		batchTime: batchTime,
	}
}

func (s *IngestionService) StartBatchProcessing(ctx context.Context) {
	op := "ingestion.startBatchProcessing"

	batch := entities.SensorInfo{}
	timer := time.NewTimer(s.batchTime)

	for {
		select {
		case <-ctx.Done():
			return
		case payload := <-s.payloadCh:
			var accel entities.SensorAccel
			if err := json.Unmarshal(payload.Payload, &accel); err != nil {
				log.Printf("%s:%s", op, err.Error())
				continue
			}
			batch.Accels = append(batch.Accels, accel)

			if len(batch.Accels) >= s.batchSize {
				uuid := uuid.New()
				key := fmt.Sprintf("ingestion:batch:%s", uuid)

				s.storage.Set(ctx, key, batch)

				if !timer.Stop() {
					<-timer.C
				}
				timer.Reset(s.batchTime)
			}
		case <-timer.C:
			if len(batch.Accels) > 0 {
				uuid := uuid.New()
				key := fmt.Sprintf("ingestion:batch:%s", uuid)

				s.storage.Set(ctx, key, batch)
				batch.Accels = []entities.SensorAccel{}
			}
			timer.Reset(s.batchTime)
		}
	}
}
