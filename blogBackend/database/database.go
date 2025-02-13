package database

import (
	models "blogBackend/model"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// ConnectDB initializes the database connection
func ConnectDB() {
	// Load environment variables
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: No .env file found")
	}

	// Get database URL from environment
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL is not set in environment variables")
	}

	// Connect to PostgreSQL using GORM
	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Optional: Adjust logging level
	})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	log.Println("Connected to database successfully")
	err = DB.AutoMigrate(&models.Blog{})
	if err != nil {
		return
	}

}

// CloseDB closes the database connection
func CloseDB() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			log.Println("Error retrieving database instance:", err)
			return
		}

		if err := sqlDB.Close(); err != nil {
			log.Println("Error closing database connection:", err)
		} else {
			log.Println("Database connection closed")
		}
	}
}
