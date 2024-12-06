package models

import "time"

type SalesTransaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ProductID       uint      `gorm:"not null" json:"product_id"`
	Product         Product   `gorm:"foreignKey:ProductID" json:"-"`
	Quantity        int       `gorm:"not null" json:"quantity"`
	TotalAmount     float64   `gorm:"not null" json:"total_amount"`
	PaymentMethod   string    `gorm:"type:enum('CASH','MPESA','CREDIT');not null" json:"payment_method"`
	CustomerName    string    `json:"customer_name,omitempty"`
	CustomerPhone   string    `json:"customer_phone,omitempty"`
	ReferenceNumber string    `json:"reference_number,omitempty"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
