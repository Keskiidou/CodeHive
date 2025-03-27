package router

import (
	"blogBackend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupRouter(app *fiber.App) {
	//list=> get
	//add=> post
	//update=> put
	//delete=> delete
	app.Get("/blog", controllers.BlogList)
	app.Post("/blog", controllers.BlogCreate)
	app.Delete("/blog", controllers.BlogDelete)
	app.Put("/blog", controllers.BlogUpdate)
	app.Get("/blog/:id", controllers.BlogGetOne)

}
