package entities

import (
	"time"
)

type Defect struct {
	DefectId      uint
	ObjectId      uint
	DefectType    string
	ObjectName    string
	Description   string
	QualityGrade  string
	Lat           float64
	Lon           float64
	Depth         float64
	Length        float64
	Width         float64
	Pressure      float32
	Diameter      int32
	Age           int32
	RmsVibration  float32
	PeakVibration float32
	AnomalyScore  float32
	Vibration     float64
	Date          time.Time
}

type DefectStateMetrics struct {
	Status string
	Count  int
}

type DefectMetrics struct {
	AvgImp       float64
	StateMetrics []DefectStateMetrics
}

type DefectsByYear struct {
	Year  int
	Count int
}

type DefectFilter struct {
	Page       int
	Limit      int
	Search     string // Поиск по типу
	PipelineID uint
	Severity   int
	DateFrom   time.Time
	DateTo     time.Time
}

type PipelineStats struct {
	TotalObjects   int64 `json:"total_objects"`
	TotalDefects   int64 `json:"total_defects"`
	CriticalIssues int64 `json:"critical_issues"`

	StatusDistribution map[string]int64 `json:"status_distribution"`
}
