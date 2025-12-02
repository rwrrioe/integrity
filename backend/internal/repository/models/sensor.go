package models

import "github.com/google/uuid"

type Sensor struct {
	SensorId     uuid.UUID `gorm:"column:sensor_id;primaryKey"`
	ObjectId     uuid.UUID
	DeviceId     uuid.UUID
	SensorTypeId uint `gorm:"column:sensor_type"`
	Name         string
	Description  string

	Object     Object     `gorm:"foreignKey:ObjectId;references:ObjectId"`
	Device     Device     `gorm:"foreignKey:DeviceId;references:DeviceId"`
	SensorType SensorType `gorm:"foreignKey:SensorTypeId;references:SensorType"`
}

type SensorType struct {
	SensorType uint
	Name       string
}
