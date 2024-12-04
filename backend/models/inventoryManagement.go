package models

import "time"

type Product struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Category    string    `json:"category,omitempty"`
	Price       float64   `json:"price"`
	Barcode     string    `json:"barcode,omitempty"`
	PhotoPath   string    `json:"photo_path,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Inventory struct {
	ID                int       `json:"id"`
	ProductID         int       `json:"product_id"`
	Quantity          int       `json:"quantity"`
	LowStockThreshold int       `json:"low_stock_threshold"`
	LastUpdated       time.Time `json:"last_updated"`
}
type StockMovement struct {
	ID             int       `json:"id"`
	ProductID      int       `json:"product_id"`
	ChangeType     string    `json:"change_type"` // SALE, PURCHASE, ADJUSTMENT
	QuantityChange int       `json:"quantity_change"`
	Note           string    `json:"note,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}
type LowStockAlert struct {
	ID           int       `json:"id"`
	ProductID    int       `json:"product_id"`
	AlertMessage string    `json:"alert_message"`
	Resolved     bool      `json:"resolved"`
	CreatedAt    time.Time `json:"created_at"`
}
type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
type CreditTransaction struct {
	ID           int       `json:"id"`
	ProductID    int       `json:"product_id"`
	Name         string    `json:"name"`
	PhoneNumber  string    `json:"phone_number,omitempty"`
	Quantity     int       `json:"quantity"`
	CreditAmount float64   `json:"credit_amount"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}
