package models

import (
	"time"

	"github.com/google/uuid"
)

type ObjectType struct {
	ObjectTypeId   uint `gorm:"primaryKey"`
	ObjectTypeName string

	Objects []Object `gorm:"foreignKey:ObjectTypeId"`
}

type Pipeline struct {
	PipelineId uint `gorm:"primaryKey"`
	Name       string
	Condition  float64

	Objects []Object `gorm:"foreignKey:PipelineId"`
}

type Method struct {
	MethodId   uint `gorm:"primaryKey"`
	MethodName string

	// Исправлено: связь с диагностиками
	Diagnostics []Diagnostic `gorm:"foreignKey:MethodId"`
}

type DefectType struct {
	DefectTypeId uint `gorm:"primaryKey"`
	Name         string

	Defects []Defect `gorm:"foreignKey:DefectTypeId"`
}

type QualityGrade struct {
	QualityGradeId uint `gorm:"primaryKey"`
	QualityGrade   string

	Defects []Defect `gorm:"foreignKey:QualityGradeId"`
}

type SensorType struct {
	SensorTypeId uint `gorm:"primaryKey"`
	Name         string
}

type InspectionType struct {
	InspectionTypeId uint `gorm:"primaryKey"`
	InspectionName   string

	Inspections []Inspection `gorm:"foreignKey:InspectionTypeId"`
}

type Employee struct {
	EmployeeId uint `gorm:"primaryKey"`
	FirstName  string
	LastName   string
	RoleId     uint

	Lat       float64
	Lon       float64
	Geography string `gorm:"type:geography(POINT,4326)"`

	Objects []Object `gorm:"many2many:object_employees;joinForeignKey:EmployeeId;joinReferences:ObjectId"`
	Defects []Defect `gorm:"many2many:defect_employees;joinForeignKey:EmployeeId;joinReferences:DefectId"`
}

type Object struct {
	ObjectId     uint   `gorm:"primaryKey"`
	ObjectName   string `gorm:"not null"`
	ObjectTypeId uint
	PipelineId   uint

	Lat      float64
	Lon      float64
	Location string `gorm:"type:geography(POINT, 4326)"`
	Material string

	// Belongs To
	ObjectType ObjectType `gorm:"foreignKey:ObjectTypeId;references:ObjectTypeId"`
	Pipeline   Pipeline   `gorm:"foreignKey:PipelineId;references:PipelineId"`

	// Has Many
	Diagnostics []Diagnostic `gorm:"foreignKey:ObjectId"`
	Defects     []Defect     `gorm:"foreignKey:ObjectId"`
	Sensors     []Sensor     `gorm:"foreignKey:ObjectId"`

	// Many to Many
	Employees []Employee `gorm:"many2many:object_employees;joinForeignKey:ObjectId;joinReferences:EmployeeId"`
}

type Diagnostic struct {
	DiagnosticId uint `gorm:"primaryKey"`
	ObjectId     uint
	MethodId     uint
	Date         time.Time

	Temperature  float64
	Humidity     float64
	Illumination float64

	Method Method `gorm:"foreignKey:MethodId;references:MethodId"`
	Object Object `gorm:"foreignKey:ObjectId;references:ObjectId"`
}

type Defect struct {
	DefectId       uint `gorm:"primaryKey"`
	ObjectId       uint
	DefectTypeId   uint
	QualityGradeId uint
	EmployeeId     uint

	Description string
	Status      string
	Date        time.Time

	Width     float64
	Length    float64
	Depth     float64
	Vibration float64

	Lat      float64
	Lon      float64
	Location string `gorm:"type:geography(POINT,4326)"`

	// Associations
	Object       Object       `gorm:"foreignKey:ObjectId;references:ObjectId"`
	DefectType   DefectType   `gorm:"foreignKey:DefectTypeId;references:DefectTypeId"`
	QualityGrade QualityGrade `gorm:"foreignKey:QualityGradeId;references:QualityGradeId"`

	Employees []Employee `gorm:"many2many:defect_employees;joinForeignKey:DefectId;joinReferences:EmployeeId"`
}

type Inspection struct {
	InspectionId     uint `gorm:"primaryKey"`
	ObjectId         uint
	InspectionTypeId uint

	Name        string
	Description string
	Date        time.Time

	InspectionType InspectionType `gorm:"foreignKey:InspectionTypeId;references:InspectionTypeId"`
}

type Sensor struct {
	SensorId     uuid.UUID `gorm:"type:uuid;primaryKey"`
	ObjectId     uint
	SensorTypeId uint `gorm:"column:sensor_type_id"`
	Name         string
	Description  string

	Object     Object     `gorm:"foreignKey:ObjectId;references:ObjectId"`
	SensorType SensorType `gorm:"foreignKey:SensorTypeId;references:SensorType"`
}

type ProbabilityHistory struct {
	ProbabilityId uint `gorm:"primaryKey"`
	ObjectId      uint
	Probability   float64
	Timestamp     *time.Time

	Object Object `gorm:"foreignKey:ObjectId;references:ObjectId"`
}
