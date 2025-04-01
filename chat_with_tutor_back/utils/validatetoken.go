package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type SignedDetails struct {
	Email     string `json:"Email"`
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	Uid       string `json:"Uid"`
	UserType  string `json:"UserType"`
}

func ValidateTokenWithAuthService(token string) (*SignedDetails, error) {
	authServiceURL := "http://localhost:9000/users/validate-token"

	req, err := http.NewRequest("POST", authServiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Ensure token has Bearer prefix if not already present
	if !strings.HasPrefix(token, "Bearer ") {
		token = "Bearer " + token
	}
	req.Header.Set("Authorization", token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to auth service: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("auth service returned %d: %s", resp.StatusCode, string(body))
	}

	var response struct {
		Message string         `json:"message"`
		Claims  *SignedDetails `json:"claims"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if response.Message != "Token is valid" {
		return nil, fmt.Errorf("token validation failed: %s", response.Message)
	}

	return response.Claims, nil
}
