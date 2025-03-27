package controllers

import (
	"blogBackend/database"
	models "blogBackend/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"log"
	"strings"
)

func BlogGetByAuthorID(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blogs retrieved successfully by AuthorID",
	}

	// Get the AuthorID from the URL params
	authorID := c.Params("author_id")
	var blogs []models.Blog

	// Find blogs by AuthorID
	if err := database.DB.Where("author_id = ?", authorID).Find(&blogs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve blogs by AuthorID",
		})
	}

	// Add the blogs list to the context
	context["blogs"] = blogs

	// Return the list of blogs in the response
	c.Status(200)
	return c.JSON(context)
}

func BlogGetOne(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog retrieved successfully",
	}

	// Get the blog ID from the URL params
	blogID := c.Params("id")
	var blog models.Blog

	// Find the blog by ID
	if err := database.DB.First(&blog, blogID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"status": "error",
				"msg":    "Blog not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve blog",
		})
	}

	// Add the blog record to the context
	context["blog"] = blog

	// Return the blog in the response
	c.Status(200)
	return c.JSON(context)
}

func BlogList(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog List",
	}
	db := database.DB
	var records []models.Blog
	db.Find(&records)
	context["blogrecords"] = records
	c.Status(200)
	return c.JSON(context)
}

func BlogCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog Created",
	}
	record := new(models.Blog)

	// Parse request body
	if err := c.BodyParser(&record); err != nil {
		log.Println("Error parsing request body: ", err)
		context["status"] = "error"
		context["msg"] = "Invalid request body"
		return c.Status(400).JSON(context)
	}

	// Ensure author and authorID are provided from the validated token (this could be passed in the request or set globally in the session)
	// Assuming you have passed `author` and `authorID` from the front end (set from validated token)
	if record.Author == "" || record.AuthorID == "" {
		context["status"] = "error"
		context["msg"] = "Author and AuthorID are required"
		return c.Status(400).JSON(context)
	}

	// Convert comma-separated tags to slice if needed
	record.Tags = parseTags(record.Tags)

	// Save the blog record in the database
	result := database.DB.Create(record)
	if result.Error != nil {
		log.Println("Error creating record: ", result.Error)
		context["status"] = "error"
		context["msg"] = "Failed to create blog"
		return c.Status(500).JSON(context)
	}

	context["blogrecord"] = record
	c.Status(201)
	return c.JSON(context)
}
func BlogDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog deleted successfully",
	}

	// Get the blog ID from the URL params
	blogID := c.Params("id")
	var blog models.Blog

	// Find the blog by ID
	if err := database.DB.First(&blog, blogID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"status": "error",
				"msg":    "Blog not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve blog",
		})
	}

	// Delete the blog from the database
	if err := database.DB.Delete(&blog).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to delete blog",
		})
	}

	// Return success message
	c.Status(200)
	return c.JSON(context)
}

func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog updated successfully",
	}

	blogID := c.Params("id")
	var blog models.Blog

	if err := database.DB.First(&blog, blogID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"status": "error",
				"msg":    "Blog not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to retrieve blog",
		})
	}

	// Parse the updated blog details
	if err := c.BodyParser(&blog); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error",
			"msg":    "Invalid input",
		})
	}

	// Convert comma-separated tags to slice if needed
	blog.Tags = parseTags(blog.Tags)

	// Save the updated blog record in the database
	if err := database.DB.Save(&blog).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to update blog",
		})
	}

	context["blogrecord"] = blog
	c.Status(200)
	return c.JSON(context)
}

// Helper function to parse comma-separated tags into a slice
func parseTags(tags []string) []string {
	var parsedTags []string
	for _, tag := range tags {
		trimmed := strings.TrimSpace(tag)
		if trimmed != "" {
			parsedTags = append(parsedTags, trimmed)
		}
	}
	return parsedTags
}
