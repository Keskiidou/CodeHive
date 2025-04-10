package controllers

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"net/http"
	"strconv"
	"time"

	"authBackend/database"
	helper "authBackend/helpers"
	"authBackend/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "users")

var validate = validator.New()

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword(userPassword string, providedPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	check := true
	msg := ""
	if err != nil {
		msg = "email or password is incorrect"
		check = false
	}
	return check, msg
}

func Signup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		var user models.User

		// Bind JSON body
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		// Validate user struct
		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + validationErr.Error()})
			return
		}

		// Check if email exists
		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			log.Println("Error checking email:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking email"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})
			return
		}

		// Check if phone exists
		count, err = userCollection.CountDocuments(ctx, bson.M{"phone": user.Phone})
		if err != nil {
			log.Println("Error checking phone:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking phone"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Phone number already taken"})
			return
		}

		// Hash password
		password := HashPassword(*user.Password)
		user.Password = &password

		// Set user timestamps and ID
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.ID = primitive.NewObjectID()
		user.UserID = user.ID.Hex()

		// Log before generating tokens
		log.Println("Generating tokens for user:", user.Email)

		// Generate tokens
		token, refreshToken, err := helper.GenerateAllTokens(*user.Email, *user.FirstName, *user.LastName, *user.UserType, user.UserID)

		// Log the tokens
		log.Println("Generated token:", token)
		log.Println("Generated refresh token:", refreshToken)

		// Check if tokens are empty
		if token == "" || refreshToken == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
			return
		}

		user.Token = &token
		user.RefreshToken = &refreshToken

		// Insert user into database
		resultInsertionNumber, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil {
			log.Println("Error inserting user:", insertErr)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error inserting user: %v", insertErr)})
			return
		}

		// Return success response
		c.JSON(http.StatusOK, gin.H{"message": "User registered successfully", "insertedID": resultInsertionNumber.InsertedID, "token": token, "refreshToken": refreshToken})
	}
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		var user models.User
		var foundUser models.User

		// Bind JSON body to user object
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if the email exists in the database
		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				// If user not found, return an error
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occurred while finding user"})
			return
		}

		// Verify password
		passwordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)
		if !passwordIsValid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": msg})
			return
		}

		// Generate tokens for the user
		token, refreshToken, err := helper.GenerateAllTokens(*foundUser.Email, *foundUser.FirstName, *foundUser.LastName, *foundUser.UserType, foundUser.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens"})
			return
		}

		// Optionally, update the user's refresh token (if needed)
		helper.UpdateAllTokens(token, refreshToken, foundUser.UserID)

		// Return user details along with generated tokens
		c.JSON(http.StatusOK, gin.H{
			"user":         foundUser,
			"userID":       foundUser.UserID,
			"token":        token,
			"refreshToken": refreshToken,
		})
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {


		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordPerPage < 1 {
			recordPerPage = 10
		}

		page, err := strconv.Atoi(c.Query("page"))
		if err != nil || page < 1 {
			page = 1
		}

		startIndex := (page - 1) * recordPerPage

		matchStage := bson.D{{"$match", bson.D{}}}
		groupStage := bson.D{{"$group", bson.D{
			{"_id", nil},
			{"total_count", bson.D{{"$sum", 1}}},
			{"data", bson.D{{"$push", "$$ROOT"}}},
		}}}
		projectStage := bson.D{{"$project", bson.D{
			{"_id", 0},
			{"total_count", 1},
			{"user_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordPerPage}}}},
		}}}

		result, err := userCollection.Aggregate(ctx, mongo.Pipeline{matchStage, groupStage, projectStage})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var allUsers []bson.M
		if err = result.All(ctx, &allUsers); err != nil {
			log.Fatal(err)
		}

		c.JSON(http.StatusOK, allUsers[0])
	}
}

func GetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("user_id")


		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		var user models.User

		err := userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

			return
		}

		c.JSON(http.StatusOK, user)
	}
}
func GetUserDetailByName() gin.HandlerFunc {
	return func(c *gin.Context) {

		firstName := c.DefaultQuery("firstname", "")
		lastName := c.DefaultQuery("lastname", "")

		if firstName == "" || lastName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both first_name and last_name are required"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		var user models.User

		err := userCollection.FindOne(ctx, bson.M{"firstname": firstName, "lastname": lastName}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
func UpgradeUserToTutor() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userID := c.Param("user_id") // Get user ID from request parameter
		var requestBody struct {
			Skills []string `json:"skills" validate:"required"` // Expecting skills from the request
		}

		// Bind request body
		if err := c.BindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
			return
		}

		// Validate that skills are provided
		if len(requestBody.Skills) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Skills cannot be empty"})
			return
		}

		// Find the user by ID
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


		err := userCollection.FindOne(ctx, bson.M{"firstname": firstName, "lastname": lastName}).Decode(&user)

		// Update user to TUTOR and set skills
		update := bson.M{
			"$set": bson.M{
				"usertype":   "TUTOR",
				"skills":     requestBody.Skills,
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

		c.JSON(http.StatusOK, gin.H{"message": "User upgraded to tutor successfully", "user_id": userID, "skills": requestBody.Skills})
	}
}
func GetAllTutors() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Define a filter to get only users with usertype "TUTOR"
		filter := bson.M{"usertype": "TUTOR"}

		// Find tutors in the database
		cursor, err := userCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving tutors"})
			return
		}
		defer cursor.Close(ctx)

		var tutors []models.User
		if err := cursor.All(ctx, &tutors); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding tutor data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tutors": tutors})
	}
}
