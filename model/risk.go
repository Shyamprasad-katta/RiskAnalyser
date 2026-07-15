package model

type Risk struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Level       string `json:"level"`
	CreatedAt   string `json:"created_at"`
}
