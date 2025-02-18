package controllers

import (
	"blogBackend/database"
	models "blogBackend/model"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"log"
)

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
		"msg":    "ADD List"}
	record := new(models.Blog)
	if err := c.BodyParser(&record); err != nil {
		log.Println("Error parsing request body: ")
		context["status"] = ""
	}
	result := database.DB.Create(record)
	if result.Error != nil {
		log.Println("Error creating record: ", result.Error)
	}
	context["msg"] = "Blog Created successfully"
	context["blogrecord"] = record
	c.Status(200)
	return c.JSON(context)
}
func BlogDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog Delete with ID:",
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

	// Delete the blog
	if err := database.DB.Delete(&blog).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to delete blog",
		})
	}

	context["msg"] = "Blog deleted successfully"
	c.Status(200)
	return c.JSON(context)
}

func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"status": "success",
		"msg":    "Blog update with ID:",
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

	// Parse the updated data from the request body
	if err := c.BodyParser(&blog); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status": "error",
			"msg":    "Invalid input",
		})
	}

	// Save the updated blog
	if err := database.DB.Save(&blog).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status": "error",
			"msg":    "Failed to update blog",
		})
	}

	context["msg"] = "Blog updated successfully"
	context["blogrecord"] = blog
	c.Status(200)
	return c.JSON(context)
}
