package models

import "github.com/google/uuid"

type Employee struct {
	EmployeeId uint `gorm:"primaryKey;"`
	FirstName  string
	LastName   string
	Phone      string

	ObjectId uuid.UUID
	Object   Object `gorm:"foreignKey:ObjectId;references:ObjectId"`
	RoleId   uint
	Role     Role `gorm:"foreignKey:RoleId;references:RoleId"`
}

type Role struct {
	RoleId      uint `gorm:"primaryKey"`
	Name        string
	Description string

	Employees []Employee `gorm:"foreignKey:RoleId"`
}
