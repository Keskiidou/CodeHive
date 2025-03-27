package routes

import (
	controller "authBackend/controllers"
	"authBackend/helpers"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AuthRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("users/signup", controller.Signup())
	incomingRoutes.POST("users/login", controller.Login())
	incomingRoutes.POST("users/validate-token", func(c *gin.Context) {
		// Get token from request headers or body
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Authorization token is required"})
			return
		}

		// Remove 'Bearer ' from the token if present
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}

		// Call the ValidateToken function
		claims, msg := helpers.ValidateToken(token)
		if msg != "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": msg})
			return
		}

		// If token is valid, return the claims
		c.JSON(http.StatusOK, gin.H{
			"message": "Token is valid",
			"claims":  claims,
		})
	})

}
