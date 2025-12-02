package entities

import "github.com/google/uuid"

type Object struct {
	ObjectId    uuid.UUID
	Name        string
	Description string
	Address     string
}

type ObjectFullInfo struct {
	Object    Object
	Devices   []Device
	Tasks     []Task
	Employees []Employee
}
