package main

import (
	"blogBackend/database"
	"blogBackend/router"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	//"fmt"
	"log"
)

func main() {
	// Initialize database connection
	database.ConnectDB()
	defer database.CloseDB()

	// Create Fiber app
	app := fiber.New()
	app.Use(logger.New())

	// Health check route
	router.SetupRouter(app)
	// Start server
	log.Println("Server running on port 8000")
	log.Fatal(app.Listen(":8000"))

}
