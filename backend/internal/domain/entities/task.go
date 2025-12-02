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

type TaskStateMetrics struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type TaskMetrics struct {
	AvgImp       float64            `json:"avg_importance"`
	StateMetrics []TaskStateMetrics `json:"state_metrics"`
}
