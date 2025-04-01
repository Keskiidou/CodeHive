package ws

import (
	"chat_with_tutor_back/database"
	"chat_with_tutor_back/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strings"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) TestAuthService(c *gin.Context) {
	// Get token from header
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization header required"})
		return
	}

	// Call the auth service
	claims, err := utils.ValidateTokenWithAuthService(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Auth service call failed",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Auth service response successful",
		"claims":  claims,
	})
}
func (h *Handler) TestGetUser(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization header required"})
		return
	}

	firstName := c.Query("firstname")
	lastName := c.Query("lastname")

	userDetails, err := utils.GetUserDetailsFromAuthService(firstName, lastName, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user details",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User details retrieved successfully",
		"user":    userDetails,
	})
}

func (h *Handler) CreateRoom(c *gin.Context) {

	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization token required"})
		return
	}

	if !strings.HasPrefix(token, "Bearer ") {
		token = "Bearer " + token
	}

	// Validate token
	claims, err := utils.ValidateTokenWithAuthService(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return
	}

	currentUserID := claims.UserType
	currentUsername := claims.FirstName

	targetFirstName := c.Query("firstname")
	targetLastName := c.Query("lastname")
	if targetFirstName == "" || targetLastName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target user names required"})
		return
	}

	targetUser, err := utils.GetUserDetailsFromAuthService(targetFirstName, targetLastName, token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target user not found", "details": err.Error()})
		return
	}

	roomID := generateRoomID(currentUserID, targetUser.UserID)

	if _, exists := h.hub.Rooms[roomID]; !exists {
		h.hub.Rooms[roomID] = &Room{
			ID:      roomID,
			Name:    fmt.Sprintf("%s and %s", currentUsername, targetFirstName),
			Users:   map[string]bool{currentUserID: true, targetUser.UserID: true},
			Clients: make(map[string]*Client),
		}
	}
	roomRepo := database.NewRoomRepository()
	if err := roomRepo.AddRoom(
		roomID,
		fmt.Sprintf("%s and %s", currentUsername, targetFirstName),
		currentUserID,
		targetUser.UserID,
	); err != nil {
		log.Printf("Failed to save room to DB: %v", err) // Optional error logging
	}

	c.JSON(http.StatusOK, gin.H{
		"room_id":   roomID,
		"user1_id":  currentUserID,
		"user2_id":  targetUser.UserID,
		"room_name": h.hub.Rooms[roomID].Name,
	})

}

func (h *Handler) JoinRoom(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}

	token := c.Query("token")
	if token == "" {
		conn.WriteJSON(gin.H{"error": "Token required"})
		conn.Close()
		return
	}

	claims, err := utils.ValidateTokenWithAuthService(token)
	if err != nil {
		conn.WriteJSON(gin.H{"error": "Invalid token"})
		conn.Close()
		return
	}

	roomID := c.Param("roomId")

	if _, ok := h.hub.Rooms[roomID]; !ok {
		roomRepo := database.NewRoomRepository()
		room, err := roomRepo.GetRoomByID(roomID)
		if err != nil {
			conn.WriteJSON(gin.H{"error": "Room does not exist"})
			conn.Close()
			return
		}

		// Store the fetched room in memory
		h.hub.Rooms[roomID] = &Room{
			ID:      room.ID,
			Name:    room.Name,
			Users:   map[string]bool{room.User1ID: true, room.User2ID: true},
			Clients: make(map[string]*Client),
		}
	}

	// Proceed with adding the client to the room
	client := &Client{
		Conn:     conn,
		Message:  make(chan *Message, 10),
		ID:       claims.UserType,
		RoomID:   roomID,
		Username: claims.FirstName,
	}
	m := &Message{
		Content:  "A new user has joined the room",
		RoomID:   roomID,
		Username: claims.FirstName,
	}

	h.hub.Register <- client
	h.hub.Broadcast <- m

	go client.writeMessage()
	go client.readMessage(h.hub)
}

func generateRoomID(userID1, userID2 string) string {

	if userID1 > userID2 {
		userID1, userID2 = userID2, userID1
	}
	return userID1 + "_" + userID2
}

func (h *Handler) GetUserRooms(c *gin.Context) {

	token := c.GetHeader("Authorization")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	claims, err := utils.ValidateTokenWithAuthService(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	roomRepo := database.NewRoomRepository()
	rooms, err := roomRepo.GetUserRooms(claims.UserType)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if len(rooms) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

type ClientRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

func (h *Handler) GetClients(c *gin.Context) {
	roomId := c.Param("roomId")

	room, exists := h.hub.Rooms[roomId]
	if !exists {
		c.JSON(http.StatusOK, []ClientRes{})
		return
	}

	clients := make([]ClientRes, 0, len(room.Clients))
	for _, client := range room.Clients {

		clients = append(clients, ClientRes{
			ID:       client.ID,
			Username: client.Username,
		})
	}

	c.JSON(http.StatusOK, clients)
}
