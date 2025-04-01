package helpers

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
)

// CheckUserType verifies the user type in the context.
func CheckUserType(c *gin.Context, role string) (err error) {
	userType := c.GetString("userType")
	err = nil
	if userType == "" {
		fmt.Println("userType not found in context")
		return errors.New("unauthorized to access this resource")
	}
	if userType != role {
		fmt.Println("User type mismatch. Expected:", role, "but got:", userType)
		err = errors.New("unauthorized to access this resource")
		return err
	}
	return err
}

// MatchUserTypeToUid checks if the user type and ID match in the context.
func MatchUserTypeToUid(c *gin.Context) (err error) {
	userType := c.GetString("userType") // Consistent key

	err = nil
	if userType != "ADMIN" {
		err = errors.New("Unauthorized to access this resource")
		return err
	}
	//CheckUserType(c, userType)
	return err
}
