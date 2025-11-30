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

// Device Entitiy -> Device Model
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
