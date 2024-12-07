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

type MpesaTransaction struct {
	ID                string `gorm:"primaryKey;type:varchar(36)"`
	MerchantRequestID string `gorm:"uniqueIndex;type:varchar(50)"`
	CheckoutRequestID string `gorm:"uniqueIndex;type:varchar(50)"`
	ResultCode        int
	Amount            float64
	PhoneNumber       string    `gorm:"type:varchar(15)"`
	Reference         string    `gorm:"type:varchar(50)"`
	Description       string    `gorm:"type:varchar(100)"`
	ReceiptNumber     string    `gorm:"uniqueIndex;type:varchar(50)"`
	TransactionDate   string    `gorm:"type:varchar(20)"`
	Status            string    `gorm:"type:varchar(20)"`
	CreatedAt         time.Time `gorm:"autoCreateTime"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime"`
}
