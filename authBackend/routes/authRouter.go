package routes

import (
	controller "authBackend/controllers"
	"authBackend/helpers"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func AuthRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("users/signup", controller.Signup())
	incomingRoutes.POST("users/login", controller.Login())
	incomingRoutes.POST("users/validate-token", func(c *gin.Context) {

		token := c.GetHeader("Authorization")

		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Authorization token is required"})
			return
		}

		if strings.HasPrefix(token, "Bearer ") {
			token = token[7:]
		}

		claims, msg := helpers.ValidateToken(token)
		if msg != "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": msg})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Token is valid",
			"claims":  claims,
		})
	})

}
