package controllers

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"time"

	"authBackend/database"
	"authBackend/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	_ "go.mongodb.org/mongo-driver/mongo"
)

var tutorRequestValidate = validator.New()

func SendTutorRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var tutorReq models.TutorRequest

		// Bind JSON to tutor request model
		if err := c.BindJSON(&tutorReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		// Validate the request fields
		if err := tutorRequestValidate.Struct(tutorReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
			return
		}

		// Set created timestamp
		tutorReq.CreatedAt = time.Now()

		// Open the tutor_requests collection
		tutorRequestCollection := database.OpenCollection(database.Client, "tutor_requests")

		// Insert the tutor request into the collection
		result, err := tutorRequestCollection.InsertOne(ctx, tutorReq)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving tutor request: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Tutor request submitted successfully",
			"id":      result.InsertedID,
		})
	}

}
func DeleteTutorRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Get the request ID from the URL parameter
		requestID := c.Param("request_id")
		if requestID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "RequestID is required"})
			return
		}

		// Convert the request ID from string to ObjectID
		objID, err := primitive.ObjectIDFromHex(requestID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID format"})
			return
		}

		// Open the tutor_requests collection
		tutorRequestCollection := database.OpenCollection(database.Client, "tutor_requests")

		// Filter by the ObjectID of the request
		filter := bson.M{"_id": objID}

		// Delete the tutor request document
		result, err := tutorRequestCollection.DeleteOne(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting tutor request: " + err.Error()})
			return
		}

		// Check if a document was deleted
		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tutor request not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Tutor request deleted successfully"})
	}
}

func GetAllTutorRequests() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		tutorRequestCollection := database.OpenCollection(database.Client, "tutor_requests")

		// Find all tutor requests
		cursor, err := tutorRequestCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching tutor requests: " + err.Error()})
			return
		}
		defer cursor.Close(ctx)

		var tutorRequests []models.TutorRequest
		if err = cursor.All(ctx, &tutorRequests); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding tutor requests: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, tutorRequests)
	}
}
func UpgradeUserToTutor() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userID := c.Param("user_id") // Get user ID from request parameter

		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
			return
		}

		// Ensure userID is ObjectId for database operations
		objID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check if the user is already a TUTOR
		if user.UserType != nil && *user.UserType == "TUTOR" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is already a tutor"})
			return
		}

		// Update user to TUTOR
		update := bson.M{
			"$set": bson.M{
				"usertype":   "TUTOR",
				"updated_at": time.Now(),
			},
		}

		result, err := userCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		if result.ModifiedCount == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No changes made"})
			return
		}

		// Return success response
		c.JSON(http.StatusOK, gin.H{
			"message": "User upgraded to tutor successfully",
			"user_id": userID,
		})
	}
}
