package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type UserDetails struct {
	UserID   string `json:"user_id"`
	Username string `json:"first_name"`
}

func GetUserDetailsFromAuthService(firstName, lastName, token string) (*UserDetails, error) {
	if firstName == "" || lastName == "" {
		return nil, fmt.Errorf("both firstname and lastname are required")
	}

	// Build the URL with query parameters
	url := fmt.Sprintf("http://localhost:9000/username?firstname=%s&lastname=%s",
		url.QueryEscape(firstName),
		url.QueryEscape(lastName))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Add authorization header
	if !strings.HasPrefix(token, "Bearer ") {
		token = "Bearer " + token
	}
	req.Header.Set("Authorization", token)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request to auth service failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("auth service returned %d: %s", resp.StatusCode, string(body))
	}

	var authResponse struct {
		UserID   string `json:"user_id"`
		Username string `json:"first_name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if authResponse.UserID == "" {
		return nil, fmt.Errorf("user_id not found in response")
	}

	return &UserDetails{
		UserID:   authResponse.UserID,
		Username: authResponse.Username,
	}, nil
}
