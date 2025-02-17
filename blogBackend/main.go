package main

import (
	"blogBackend/database"
	"blogBackend/router"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	//"fmt"
	"log"
)

//go run dev

func main() {
	// Initialize database connection
	database.ConnectDB()
	defer database.CloseDB()

	// Create Fiber app
	app := fiber.New()
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Allows requests from any domain
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Health check route
	router.SetupRouter(app)
	// Start server
	log.Println("Server running on port 8000")
	log.Fatal(app.Listen(":8000"))

}
