package models

import "time"

type Room struct {
	ID        string    `bson:"_id"`
	Name      string    `bson:"name"`
	User1ID   string    `bson:"user1_id"` // Add these
	User2ID   string    `bson:"user2_id"` // Add these
	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}
