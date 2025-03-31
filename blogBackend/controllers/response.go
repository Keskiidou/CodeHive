package controllers

import (
	"blogBackend/database"
	"blogBackend/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"log"
)

// Get all responses for a specific blog post
func GetResponsesByBlogID(c *fiber.Ctx) error {
	blogID := c.Params("blog_id")
	var responses []model.Response

	if err := database.DB.Where("blog_id = ?", blogID).Find(&responses).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve responses",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"status":    "success",
		"msg":       "Responses retrieved successfully",
		"responses": responses,
	})
}

// Create a new response for a blog post
func CreateResponse(c *fiber.Ctx) error {
	response := new(model.Response)

	if err := c.BodyParser(response); err != nil {
		log.Println("Error parsing request body:", err)
		return c.Status(400).JSON(fiber.Map{
			"status": "error",
			"msg":    "Invalid request body",
		})
	}

	if response.BlogID == 0 || response.Author == "" || response.AuthorID == "" || response.Content == "" {
		return c.Status(400).JSON(fiber.Map{
			"status": "error",
			"msg":    "BlogID, Author, AuthorID, and Content are required",
		})
	}

	if err := database.DB.Create(response).Error; err != nil {
		log.Println("Error creating response:", err)
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to create response",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"status":   "success",
		"msg":      "Response created successfully",
		"response": response,
	})
}

// Delete a response by ID
func DeleteResponse(c *fiber.Ctx) error {
	responseID := c.Params("id")
	var response model.Response

	if err := database.DB.First(&response, responseID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"status": "error",
				"msg":    "Response not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve response",
		})
	}

	if err := database.DB.Delete(&response).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to delete response",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"status": "success",
		"msg":    "Response deleted successfully",
	})
}
