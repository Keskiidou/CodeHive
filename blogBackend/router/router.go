package router

import (
	"blogBackend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupRouter(app *fiber.App) {
	//list => get
	//add => post
	//update => put
	//delete => delete
	app.Get("/blog", controllers.BlogList)
	app.Post("/blog", controllers.BlogCreate)
	app.Put("/blog", controllers.BlogUpdate)
	app.Delete("/blogs/:id", controllers.BlogDelete)
	app.Get("/blog/:id", controllers.BlogGetOne)
	app.Get("/blogs/author/:author_id", controllers.BlogGetByAuthorID)
}
