package entities

import (
	"github.com/google/uuid"
)

type Sensor struct {
	SensorId    uuid.UUID
	ObjectId    uuid.UUID
	DeviceId    uuid.UUID
	SensorType  string
	Name        string
	Description string
}

type SensorType struct {
	SensorType uint
	Name       string
}

type SensorInfo struct {
	SensorId uuid.UUID
	Accels   []SensorAccel
}

type SensorAccel struct {
	Timestamp int64
	X         float64
	Y         float64
	Z         float64
}

type SensorAnalytics struct {
	SensorId  uuid.UUID
	Timestamp int64
	Anomaly   bool
	Severity  float64
	RMS       float64
	Peak      float64
}
