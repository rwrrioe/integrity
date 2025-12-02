package entities

import "github.com/google/uuid"

type Employee struct {
	EmployeeId uint
	FirstName  string
	LastName   string
	Phone      string
	ObjectId   uuid.UUID
	RoleId     uint
	RoleName   string
}

type Role struct {
	RoleId      uint
	Name        string
	Description string
}
