package database

import (
	"chat_with_tutor_back/models"
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

type RoomRepository struct {
	collection *mongo.Collection
}

func NewRoomRepository() *RoomRepository {
	return &RoomRepository{
		collection: OpenCollection(Client, "rooms"), // Uses your existing DB connection
	}
}

func (r *RoomRepository) AddRoom(roomID, roomName, user1ID, user2ID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, models.Room{
		ID:        roomID,
		Name:      roomName,
		User1ID:   user1ID,
		User2ID:   user2ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	})

	return err
}
func (r *RoomRepository) GetUserRooms(userID string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"user1_id": userID},
			{"user2_id": userID},
		},
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rooms []map[string]interface{}
	for cursor.Next(ctx) {
		var result bson.M
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		rooms = append(rooms, map[string]interface{}{
			"room_id":   result["_id"],
			"room_name": result["name"],
			"user1_id":  result["user1_id"],
			"user2_id":  result["user2_id"],
		})
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return rooms, nil
}
func (r *RoomRepository) GetRoomByID(roomID string) (*models.Room, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var room models.Room
	err := r.collection.FindOne(ctx, bson.M{"_id": roomID}).Decode(&room)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, fmt.Errorf("room not found")
		}
		return nil, err
	}

	return &room, nil
}
