package main

import (
	"chat_with_tutor_back/internal/ws"
	"chat_with_tutor_back/router"
	"github.com/joho/godotenv"
	"log"
)

func init() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found. Using system environment variables.")
	}
}

func main() {

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	router.InitRouter(wsHandler)
	router.Start("0.0.0.0:8080")
}
