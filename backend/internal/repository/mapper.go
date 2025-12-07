package repository

import (
	"fmt"
	"strings"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
)

func DefectToEntity(m models.Defect) entities.Defect {
	return entities.Defect{
		DefectId:     m.DefectId,
		ObjectName:   m.Object.ObjectName,
		DefectType:   m.DefectType.Name,
		Description:  m.Description,
		QualityGrade: m.QualityGrade.QualityGrade,
		Depth:        m.Depth,
		Length:       m.Length,
		Width:        m.Width,
		Vibration:    m.Vibration,
		Date:         m.Date,
	}
}

func DefectToModel(e entities.Defect) (models.Defect, bool) {
	id, ok := qualityGradeToId(e.QualityGrade)
	if !ok {
		return models.Defect{}, false
	}

	return models.Defect{
		DefectId:       e.DefectId,
		Description:    e.Description,
		QualityGradeId: uint(id),
		Depth:          e.Depth,
		Length:         e.Length,
		Width:          e.Width,
		Vibration:      e.Vibration,
		Date:           e.Date,
	}, true
}

func DiagnosticToEntity(m models.Diagnostic) entities.Diagnostic {
	return entities.Diagnostic{
		DiagnosticId: m.DiagnosticId,
		ObjectId:     m.ObjectId,
		Method:       entities.METHOD(m.MethodId),
		Date:         m.Date,
		Temperature:  m.Temperature,
		Humidity:     m.Humidity,
		Illumination: m.Illumination,
	}
}

func DiagnosticToModel(e entities.Diagnostic) models.Diagnostic {
	return models.Diagnostic{
		DiagnosticId: e.DiagnosticId,
		ObjectId:     e.ObjectId,
		MethodId:     uint(e.Method),
		Date:         e.Date,
		Temperature:  e.Temperature,
		Humidity:     e.Humidity,
		Illumination: e.Illumination,
	}
}

func ObjectToEntity(m models.Object) entities.Object {
	return entities.Object{
		ObjectId: m.ObjectId,
		Name:     m.ObjectName,
		Lat:      m.Lat,
		Lon:      m.Lon,
		Material: m.Material,
	}
}

func ObjectToModel(e entities.Object) models.Object {
	return models.Object{
		ObjectId:   e.ObjectId,
		ObjectName: e.Name,
		Lat:        e.Lat,
		Lon:        e.Lon,
		Material:   e.Material,
	}
}

func SensorToEntity(m models.Sensor) entities.Sensor {
	return entities.Sensor{
		SensorId:    m.SensorId,
		ObjectId:    m.ObjectId,
		SensorType:  fmt.Sprint(m.SensorTypeId),
		Name:        m.Name,
		Description: m.Description,
	}
}

func SensorToModel(e entities.Sensor) models.Sensor {
	return models.Sensor{
		SensorId:     e.SensorId,
		ObjectId:     e.ObjectId,
		SensorTypeId: 0,
		Name:         e.Name,
		Description:  e.Description,
	}
}

func EmployeeToModel(e entities.Employee) models.Employee {
	return models.Employee{
		EmployeeId: e.EmployeeId,
		FirstName:  e.FirstName,
		LastName:   e.LastName,
		RoleId:     e.RoleId,
		Lon:        e.Lat,
		Lat:        e.Lon,
	}
}

// --- Model → Entity ---
func EmployeeToEntity(m models.Employee) entities.Employee {
	return entities.Employee{
		EmployeeId: m.EmployeeId,
		FirstName:  m.FirstName,
		LastName:   m.LastName,
		RoleId:     m.RoleId,
		Lon:        m.Lon,
		Lat:        m.Lat,
	}
}

var qualityGradeMap = map[string]int{
	"удовлетворительно": 1,
	"допустимо":         2,
	"требует мер":       3,
	"недопустимо":       4,
}

func qualityGradeToId(s string) (int, bool) {
	s = strings.TrimSpace(strings.ToLower(s))
	id, ok := qualityGradeMap[s]
	return id, ok
}
