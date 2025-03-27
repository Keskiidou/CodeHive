package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	FirstName    *string            `json:"first_name" validate:"required,min=2,max=100"`
	LastName     *string            `json:"last_name" validate:"required,min=2,max=100"`
	Email        *string            `json:"email" validate:"required,email" bson:"email,omitempty,unique"`
	Phone        *string            `json:"phone" validate:"required"`
	Password     *string            `json:"password" validate:"required,min=8"` // Minimum 8 chars for better security
	Token        *string            `json:"token"`
	UserType     *string            `json:"user_type" validate:"required,oneof=ADMIN USER"` // Corrected validation syntax
	RefreshToken *string            `json:"refresh_token,omitempty"`                        // JWT should not be stored, only refresh token
	CreatedAt    time.Time          `json:"created_at" bson:"created_at,omitempty"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updated_at,omitempty"`
	UserID       string             `json:"user_id" bson:"user_id,omitempty"`
}
