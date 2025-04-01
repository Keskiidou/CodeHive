package routes

import (
	controller "authBackend/controllers"
	"authBackend/middleware"
	"github.com/gin-gonic/gin"
)

func UserRoutes(incomingRoute *gin.Engine) {
	incomingRoute.Use(middleware.Authenticate())
	incomingRoute.GET("/users", controller.GetUsers())
	incomingRoute.GET("/users/:user_id", controller.GetUser())
	incomingRoute.GET("/username", controller.GetUserDetailByName())

}
