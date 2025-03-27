package helpers

import (
	"authBackend/database"
	"context"
	"fmt"
	jwt "github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"os"
	"time"
)

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Uid       string
	UserType  string
	jwt.StandardClaims
}

var UserCollection *mongo.Collection = database.OpenCollection(database.Client, "user")

var SECRET_KEY = os.Getenv("SECRET_KEY")

func GenerateAllTokens(email string, firstName string, lastName string, uid string, userType string) (signedToken string, signedRefreshToken string, err error) {
	claims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Uid:       uid,
		UserType:  userType,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(24)).Unix(),
		},
	}
	refreshClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Uid:       uid,
		UserType:  userType,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(24)).Unix(),
		},
	}

	Token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(SECRET_KEY))
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(SECRET_KEY))

	if err != nil {
		log.Panic(err)
		return
	}
	return Token, refreshToken, err
}
func ValidateToken(signedToken string) (claims *SignedDetails, msg string) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&SignedDetails{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(SECRET_KEY), nil
		},
	)
	if err != nil {
		msg = err.Error()
		return
	}
	claims, ok := token.Claims.(*SignedDetails)
	if !ok {
		msg = fmt.Sprintf("Invalid token claims")
		msg = err.Error()
		return
	}
	if claims.ExpiresAt < time.Now().Local().Unix() {
		msg = fmt.Sprintf("Token expired")
		msg = err.Error()
		return
	}
	return claims, msg
}

func UpdateAllTokens(signedToken string, signedRefreshToken string, userID string) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	// Create the update document using $set operator
	updateObj := bson.M{
		"$set": bson.M{
			"token":         signedToken,
			"refresh_token": signedRefreshToken,
			"updated_at":    time.Now(),
		},
	}

	// Filter to match the user by userID
	filter := bson.M{"userID": userID}

	// Options for upsert (insert if not found)
	upsert := true
	opt := options.UpdateOptions{
		Upsert: &upsert,
	}

	// Perform the update
	_, err := UserCollection.UpdateOne(ctx, filter, updateObj, &opt)
	if err != nil {
		log.Panic("Error updating tokens:", err)
		return
	}
}
