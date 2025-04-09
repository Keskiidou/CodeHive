package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TutorRequest represents the payload for a tutor request.
type TutorRequest struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID             string             `json:"user_id" validate:"required"`
	Skills             []string           `json:"skills" validate:"required"`
	Motivation         string             `json:"motivation" validate:"required"`
	Availability       string             `json:"availability" validate:"required"`
	TeachingExperience string             `json:"teaching_experience"` // Optional field
	CreatedAt          time.Time          `json:"created_at"`
}
