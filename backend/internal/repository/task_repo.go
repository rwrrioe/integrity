package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"gorm.io/gorm"
)

var ErrTaskNotFound = fmt.Errorf("task not found")

type TaskRepo interface {
	GetTask(ctx context.Context, taskId int) (*entities.Task, error)
	SaveTask(ctx context.Context, task *entities.Task) error
	ChangeStatus(ctx context.Context, taskId int, status string) error
	AssignEmployee(ctx context.Context, taskId int, employeeId int) error
	ListByObject(ctx context.Context, objectId int) (*[]entities.Task, error)
}

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepo(db *gorm.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) GetTask(ctx context.Context, taskId int) (*entities.Task, error) {
	var model models.Task
	if err := r.db.WithContext(ctx).First(&model, taskId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	task := TaskToEntity(model)
	return &task, nil
}

func (r *TaskRepository) SaveTask(ctx context.Context, task *entities.Task) error {
	model := TaskToModel(*task)

	if err := r.db.WithContext(ctx).Save(&model).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTaskNotFound
		}
		return err
	}

	return nil
}

func (r *TaskRepository) ChangeStatus(ctx context.Context, taskId int, status string) error {
	task, err := r.GetTask(ctx, taskId)
	if err != nil {
		return err
	}

	model := TaskToModel(*task)
	model.Status = status
	result := r.db.WithContext(ctx).Save(&model)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return ErrTaskNotFound
		}
		return result.Error
	}
	return nil
}

func (r *TaskRepository) AssignEmployee(ctx context.Context, taskId int, employeeId int) error {
	var model models.Task

	if err := r.db.WithContext(ctx).First(&model, taskId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTaskNotFound
		}
		return err
	}

	var employee models.Employee

	if err := r.db.First(&employee, "employee_id=?", employeeId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTaskNotFound
		}
		return err
	}

	if err := r.db.Model(&model).Association("Employees").Append(&employee); err != nil {
		return err
	}
	return nil
}

func (r *TaskRepository) ListByObject(ctx context.Context, objectId int) (*[]entities.Task, error) {
	var models []models.Task

	if err := r.db.WithContext(ctx).Where("object_id=?", objectId).Preload("Employees").Find(&models).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}
	var tasks []entities.Task
	for _, model := range models {
		task := TaskToEntity(model)
		tasks = append(tasks, task)
	}
	return &tasks, nil
}
