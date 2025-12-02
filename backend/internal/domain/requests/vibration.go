package requests

import "github.com/google/uuid"

type VibrationRequest struct {
	DeviceId uuid.UUID
	AccelX   []float64
	AccelY   []float64
	AccelZ   []float64
}
