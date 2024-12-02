package models

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Register struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type User struct {
	ID       int    `json:"id"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
