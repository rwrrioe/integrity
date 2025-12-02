package models

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	TaskId      uint      `gorm:"primaryKey;"`
	DeviceId    uuid.UUID `gorm:"column:device_id"`
	ObjectId    uuid.UUID
	Name        string    `gorm:"not null"`
	Description string    `gorm:"not null"`
	CreatedAt   time.Time `gorm:"column:occurred_at"`
	SolvedAt    *time.Time
	Importance  float64 `gorm:"not null"`
	Status      string  `gorm:"not null"`
	AssignedTo  uint

	Object    Object     `gorm:"foreignKey:ObjectId;references:ObjectId"`
	Device    Device     `gorm:"foreignKey:DeviceId;references:DeviceId"`
	Employees []Employee `gorm:"many2many:task_employees;joinForeignKey:TaskId;joinReferences:EmployeeId"`
}
