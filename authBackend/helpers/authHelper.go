package helpers

import (
	"errors"
	"github.com/gin-gonic/gin"
)

// CheckUserType verifies the user type in the context.
func CheckUserType(c *gin.Context, role string) (err error) {
	userType := c.GetString("userType") // Consistent key
	err = nil
	if userType != role {
		err = errors.New("unauthorized to access this resource")
		return err
	}
	return err
}

// MatchUserTypeToUid checks if the user type and ID match in the context.
func MatchUserTypeToUid(c *gin.Context, userId string) (err error) {
	userType := c.GetString("userType") // Consistent key
	uid := c.GetString("uid")           // Consistent key
	err = nil
	if userType == "USER" && uid != userId {
		err = errors.New("Unauthorized to access this resource")
		return err
	}
	CheckUserType(c, userType)
	return err
}
