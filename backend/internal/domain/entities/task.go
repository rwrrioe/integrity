package entities

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	TaskId      uint
	DeviceId    uuid.UUID
	ObjectId    uuid.UUID
	Name        string
	Description string
	CreatedAt   time.Time
	SolvedAt    *time.Time
	Importance  float64
	Status      string
	AssignedTo  uint
}
