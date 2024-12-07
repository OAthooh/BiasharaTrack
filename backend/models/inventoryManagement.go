package models

import "time"

type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	Category    string    `json:"category,omitempty"`
	Price       float64   `gorm:"not null" json:"price"`
	Barcode     string    `gorm:"unique" json:"barcode,omitempty"`
	PhotoPath   string    `json:"photo_path,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Inventory struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	ProductID         uint      `gorm:"not null" json:"product_id"`
	Product           Product   `gorm:"foreignKey:ProductID" json:"-"`
	Quantity          int       `gorm:"not null;default:0" json:"quantity"`
	LowStockThreshold int       `gorm:"not null;default:10" json:"low_stock_threshold"`
	LastUpdated       time.Time `gorm:"autoUpdateTime" json:"last_updated"`
}

// TableName overrides the table name used by Inventory to `inventory`
func (Inventory) TableName() string {
	return "inventory"
}

type StockMovement struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ProductID      uint      `gorm:"not null" json:"product_id"`
	Product        Product   `gorm:"foreignKey:ProductID" json:"-"`
	ChangeType     string    `gorm:"type:enum('SALE','PURCHASE','ADJUSTMENT');not null" json:"change_type"`
	QuantityChange int       `gorm:"not null" json:"quantity_change"`
	Note           string    `gorm:"type:text" json:"note,omitempty"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type LowStockAlert struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `gorm:"not null" json:"product_id"`
	Product      Product   `gorm:"foreignKey:ProductID" json:"-"`
	AlertMessage string    `gorm:"type:text;not null" json:"alert_message"`
	Resolved     bool      `gorm:"default:false" json:"resolved"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"unique;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

