package entities

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	DeviceId     uuid.UUID
	ObjectId     uuid.UUID
	Name         string
	Description  string
	Condition    float64
	Status       string
	LastRepaired *time.Time
}

type DeviceAnalytics struct {
	DeviceId  uuid.UUID `json:"device_id"`
	Analytics string    `json:"analytics"`
}
