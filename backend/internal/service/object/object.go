package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository"
)

type ObjectProvider interface {
	GetObjectInfo(ctx context.Context, objectId uuid.UUID) (*entities.ObjectFullInfo, error)
}

type ObjectService struct {
	objrepo  repository.ObjectRepo
	taskrepo repository.TaskRepo
	devrepo  repository.DeviceRepo
	emplrepo repository.EmployeeRepo
}

func NewObjectService(objrepo repository.ObjectRepo, taskrepo repository.TaskRepo, devrepo repository.DeviceRepo, emplrepo repository.EmployeeRepo) *ObjectService {
	return &ObjectService{
		objrepo:  objrepo,
		taskrepo: taskrepo,
		devrepo:  devrepo,
		emplrepo: emplrepo,
	}
}

func (s *ObjectService) GetObjectInfo(ctx context.Context, objectId uuid.UUID) (*entities.ObjectFullInfo, error) {
	object, err := s.objrepo.GetObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	employees, err := s.emplrepo.ListByObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	devices, err := s.devrepo.ListByObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	tasks, err := s.taskrepo.ListByObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	info := entities.ObjectFullInfo{
		Object:    *object,
		Devices:   *devices,
		Tasks:     *tasks,
		Employees: *employees,
	}
	return &info, nil
}
