package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

var ErrEmployeeNotFound = fmt.Errorf("employee not found")

type EmployeeRepo interface {
	GetEmployee(ctx context.Context, employeeId int) (*entities.Employee, error)
	// AddEmployee(ctx context.Context, employee *entities.Employee) error
	ListByObject(ctx context.Context, objectId uuid.UUID) (*[]entities.Employee, error)
}

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepo(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) GetEmployee(ctx context.Context, employeeId int) (*entities.Employee, error) {
	var model models.Employee
	if err := r.db.WithContext(ctx).Preload("Role").First(&model, employeeId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	employee := EmployeeToEntity(model)
	return &employee, nil
}

func (r *EmployeeRepository) ListByObject(ctx context.Context, objectId uuid.UUID) (*[]entities.Employee, error) {
	var models []models.Employee

	if err := r.db.WithContext(ctx).Preload("Role").Where("object_id=?", objectId).Find(&models).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	var employees []entities.Employee
	for _, model := range models {
		employee := EmployeeToEntity(model)
		employees = append(employees, employee)
	}

	return &employees, nil
}
