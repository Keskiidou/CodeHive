package router

import (
	"chat_with_tutor_back/internal/ws"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

var r *gin.Engine

func InitRouter(wsHandler *ws.Handler) {
	r = gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "http://localhost:3000"
		},
		MaxAge: 12 * time.Hour,
	}))

	r.POST("/ws/createRoom", wsHandler.CreateRoom)
	r.GET("/ws/joinRoom/:roomId", wsHandler.JoinRoom)
	r.GET("/ws/rooms", wsHandler.GetUserRooms)
	r.GET("/ws/getClients/:roomId", wsHandler.GetClients)

	r.POST("/test/auth", wsHandler.TestAuthService)
	r.GET("/test/user", wsHandler.TestGetUser)

}

func Start(addr string) error {
	return r.Run(addr)
}
