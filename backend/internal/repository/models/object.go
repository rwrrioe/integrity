package models

import "github.com/google/uuid"

type Object struct {
	ObjectId    uuid.UUID `gorm:"primaryKey;"`
	Name        string    `gorm:"not null"`
	Description string
	Address     string `gorm:"not null"`
}
