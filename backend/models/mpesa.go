// mpesa.go
package models

import (
	"time"
)

type MpesaTransaction struct {
	ID                string    `gorm:"primaryKey;type:varchar(36)"`
	MerchantRequestID string    `gorm:"uniqueIndex;type:varchar(50)"`
	CheckoutRequestID string    `gorm:"uniqueIndex;type:varchar(50)"`
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
