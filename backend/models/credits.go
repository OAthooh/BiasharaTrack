package models

import "time"

type CreditCustomer struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Phone           string    `json:"phone"`
	TotalCredit     float64   `json:"total_credit"`
	BalanceDue      float64   `json:"balance_due"`
	LastPaymentDate time.Time `json:"last_payment_date"`
	Status          string    `json:"status"`
}
type CreditTransaction struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `gorm:"not null" json:"product_id"`
	Product      Product   `gorm:"foreignKey:ProductID" json:"-"`
	Name         string    `gorm:"not null" json:"name"`
	PhoneNumber  string    `json:"phone_number,omitempty"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	BalanceDue   float64   `gorm:"not null" json:"balance_due"`
	CreditAmount float64   `gorm:"not null" json:"credit_amount"`
	Status       string    `gorm:"type:enum('PENDING','PAID','CANCELLED');default:'PENDING'" json:"status"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}
