package repository

import (
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
)

// Task Model -> Task Entity
func TaskToEntity(model models.Task) entities.Task {
	return entities.Task{
		TaskId:      model.TaskId,
		DeviceId:    model.DeviceId,
		ObjectId:    model.ObjectId,
		Name:        model.Name,
		Description: model.Description,
		CreatedAt:   model.CreatedAt,
		SolvedAt:    model.SolvedAt,
		Importance:  model.Importance,
		Status:      model.Status,
		AssignedTo:  model.AssignedTo,
	}
}

// Task Entity -> Task Model
func TaskToModel(entity entities.Task) models.Task {
	return models.Task{
		TaskId:      entity.TaskId,
		DeviceId:    entity.DeviceId,
		ObjectId:    entity.ObjectId,
		Name:        entity.Name,
		Description: entity.Description,
		CreatedAt:   entity.CreatedAt,
		SolvedAt:    entity.SolvedAt,
		Importance:  entity.Importance,
		Status:      entity.Status,
		AssignedTo:  entity.AssignedTo,
	}
}

// Device Model -> Device Entity
func DeviceToEntity(model models.Device) entities.Device {
	return entities.Device{
		DeviceId:     model.DeviceId,
		Name:         model.Name,
		ObjectId:     model.ObjectId,
		Description:  model.Description,
		Condition:    model.Condition,
		Status:       model.Status,
		LastRepaired: model.LastRepaired,
	}
}

// Device Entity -> Device Model
func DeviceToModel(entity entities.Device) models.Device {
	return models.Device{
		DeviceId:     entity.DeviceId,
		Name:         entity.Name,
		ObjectId:     entity.ObjectId,
		Description:  entity.Description,
		Condition:    entity.Condition,
		Status:       entity.Status,
		LastRepaired: entity.LastRepaired,
	}
}

// Object Model -> Object Entity
func ObjectToEntity(model models.Object) entities.Object {
	return entities.Object{
		ObjectId:    model.ObjectId,
		Name:        model.Name,
		Description: model.Description,
		Address:     model.Address,
	}
}

// Device Entity -> Device Model
func ObjectToModel(entity entities.Object) models.Object {
	return models.Object{
		ObjectId:    entity.ObjectId,
		Name:        entity.Name,
		Description: entity.Description,
		Address:     entity.Address,
	}
}

// Employee Model -> Employee Entity
func EmployeeToEntity(model models.Employee) entities.Employee {
	return entities.Employee{
		EmployeeId: model.EmployeeId,
		FirstName:  model.FirstName,
		LastName:   model.LastName,
		Phone:      model.Phone,
		ObjectId:   model.ObjectId,
		RoleId:     model.RoleId,
		RoleName:   model.Role.Name,
	}
}

// Employee Entity -> Employee Model
func EmployeeToModel(entity entities.Employee) models.Employee {
	return models.Employee{
		EmployeeId: entity.EmployeeId,
		FirstName:  entity.FirstName,
		LastName:   entity.LastName,
		Phone:      entity.Phone,
		ObjectId:   entity.ObjectId,
		RoleId:     entity.RoleId,
	}
}

// Sensor Model -> Sensor Entity
func SensorToEntity(model models.Sensor) entities.Sensor {
	return entities.Sensor{
		SensorId:    model.SensorId,
		ObjectId:    model.ObjectId,
		DeviceId:    model.DeviceId,
		SensorType:  model.SensorType.Name,
		Name:        model.Name,
		Description: model.Description,
	}
}

// Sensor Entity -> Sensor Model
func SensorToModel(entity entities.Sensor) models.Sensor {
	typeId := sensorTypeMap[entity.SensorType]

	return models.Sensor{
		SensorId:     entity.SensorId,
		DeviceId:     entity.DeviceId,
		ObjectId:     entity.DeviceId,
		SensorTypeId: typeId,
		Name:         entity.Name,
		Description:  entity.Description,
	}
}

var sensorTypeMap = map[string]uint{
	"Трехосевой цифровой акселерометр": 1,
}
