package models

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	DeviceId     uuid.UUID `gorm:"column:device_id;primaryKey"`
	ObjectId     uuid.UUID
	Name         string     `gorm:"column:name; not null"`
	Description  string     `gorm:"column:description"`
	Condition    float64    `gorm:"column:condition"`
	Status       string     `gorm:"column:status"`
	LastRepaired *time.Time `gorm:"column:last_repaired"`

	Object Object `gorm:"foreignKey:ObjectId;references:ObjectId"`
}
