package entities

import "github.com/google/uuid"

type Object struct {
	ObjectId    uuid.UUID
	Name        string
	Description string
	Address     string
}
