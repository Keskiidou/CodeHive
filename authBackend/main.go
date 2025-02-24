package main

import (
	routes "authBackend/routes"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found. Using system environment variables.")
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		log.Fatal("Error: SECRET_KEY is not set. Exiting application.")
	}

	router := gin.New()
	router.Use(gin.Logger())

	// Explicit CORS settings
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.AuthRoutes(router)
	routes.UserRoutes(router)

	router.GET("/api1", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "all good for api 1"})
	})
	router.GET("/api2", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "all good for api 2"})
	})

	log.Println("Server running on port:", port)
	router.Run(":" + port)
}
