package service

import (
	"context"

	"github.com/google/uuid"
	grpcClient "github.com/rwrrioe/integrity/backend/internal/clients/sensors/grpc"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
)

type SensorProvider interface {
	GetInfo(ctx context.Context, sensorId uuid.UUID) (*entities.SensorAccel, error)
	GetAnalytics(ctx context.Context, sensorId uuid.UUID) (*entities.SensorAnalytics, error)
}

type SensorService struct {
	grpcClient *grpcClient.Client
}

func NewSensorService(client *grpcClient.Client) *SensorService {
	return &SensorService{grpcClient: client}
}

func (s *SensorService) GetInfo(ctx context.Context, sensorId uuid.UUID) (*entities.SensorAccel, error) {
	//TODO add MQTT call

	return nil, nil
}

// func (s *SensorService) GetAnalytics(ctx context.Context, info *entities.SensorInfo) (*entities.SensorAnalytics, error) {
// 	var accelX, accelY, accelZ []float64

// 	for _, accel := range info.Accels {
// 		accelX = append(accelX, accel.X)
// 		accelY = append(accelY, accel.Y)
// 		accelZ = append(accelZ, accel.Z)
// 	}

// 	resp, err := s.grpcClient.AnalyzeVibration(ctx, &requests.VibrationRequest{
// 		DeviceId: info.SensorId,
// 		AccelX:   accelX,
// 		AccelY:   accelY,
// 		AccelZ:   accelZ,
// 	})
// 	timestamp := time.Now().Unix()

// 	if err != nil {
// 		return nil, err
// 	}

// 	return &entities.SensorAnalytics{
// 		SensorId:  info.SensorId,
// 		Timestamp: timestamp,
// 		Anomaly:   resp.Anomaly,
// 		Severity:  resp.Severity,
// 		RMS:       resp.RMS,
// 		Peak:      resp.Severity,
// 	}, nil
// }
