package controllers

import (
	"fmt"
	"time"

	"github.com/OAthooh/BiasharaTrack.git/models"
	"github.com/OAthooh/BiasharaTrack.git/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SalesManagementHandler struct {
	db *gorm.DB
}

func NewSalesManagementHandler(db *gorm.DB) *SalesManagementHandler {
	return &SalesManagementHandler{db: db}
}

// Define the structure for a single sell request
type SellRequest struct {
	ProductID uint    `json:"product_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required"`
	Note      string  `json:"note"`
	Amount    float64 `json:"amount"`
}

// Define the structure for the sale data from the front end
type SaleData struct {
	Products        []SellRequest `json:"products" binding:"required"`
	PaymentMethod   string        `json:"payment_method"`
	CustomerName    string        `json:"customer_name"`
	CustomerPhone   string        `json:"customer_phone"`
	ReferenceNumber string        `json:"reference_number"`
}

func (im *SalesManagementHandler) SellProducts(c *gin.Context) {
	// Check if request body is empty
	if c.Request.Body == nil {
		utils.ErrorLogger("Request body is empty")
		c.JSON(400, gin.H{"error": "Request body is required"})
		return
	}

	// Parse the request body as SaleData
	var saleData SaleData
	if err := c.ShouldBindJSON(&saleData); err != nil {
		utils.ErrorLogger("Failed to parse request body: %v", err)
		c.JSON(400, gin.H{
			"error":   "Invalid request format. Expected JSON with sale data",
			"details": err.Error(),
		})
		return
	}

	// Validate the products array is not empty
	if len(saleData.Products) == 0 {
		utils.ErrorLogger("Empty products array received")
		c.JSON(400, gin.H{"error": "At least one product is required"})
		return
	}

	// validate payment method and sale type
	if saleData.PaymentMethod == "" {
		utils.ErrorLogger("Incomplete sale request in payment method or sale type")
		c.JSON(400, gin.H{"error": "Payment method is required"})
		return
	}

	// Validate credit sale requirements
	if saleData.PaymentMethod == "CREDIT" {
		if saleData.CustomerName == "" || saleData.CustomerPhone == "" {
			utils.WarningLogger("Incomplete credit sale request for product %d", saleData.Products[0].ProductID)
			c.JSON(400, gin.H{"error": fmt.Sprintf("Name and phone number are required for credit sales for product %d", saleData.Products[0].ProductID)})
			return
		}
	}
	utils.InfoLogger("Processing sale for product %s", saleData.PaymentMethod)

	processSales(saleData, im, c)
}

func processSales(saleData SaleData, im *SalesManagementHandler, c *gin.Context) {
	// Start transaction
	tx := im.db.Begin()
	if tx.Error != nil {
		utils.ErrorLogger("Failed to start transaction: %v", tx.Error)
		c.JSON(500, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, sellRequest := range saleData.Products {

		// Get current inventory
		var inventory models.Inventory
		if err := tx.Where("product_id = ?", sellRequest.ProductID).First(&inventory).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Product not found in inventory: product_id= %d %v", sellRequest.ProductID, err)
			c.JSON(404, gin.H{"error": fmt.Sprintf("Product %d not found in inventory", sellRequest.ProductID)})
			return
		}

		// Check if we have enough stock
		if inventory.Quantity < sellRequest.Quantity {
			tx.Rollback()
			utils.WarningLogger("Insufficient stock for product %d. Requested: %d, Available: %d",
				sellRequest.ProductID, sellRequest.Quantity, inventory.Quantity)
			c.JSON(400, gin.H{"error": fmt.Sprintf("Insufficient stock for product %d", sellRequest.ProductID)})
			return
		}

		// Update inventory
		inventory.Quantity -= sellRequest.Quantity
		inventory.LastUpdated = time.Now()
		if err := tx.Save(&inventory).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Failed to update inventory for product %d: %v", sellRequest.ProductID, err)
			c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to update inventory for product %d", sellRequest.ProductID)})
			return
		}

		// Record stock movement
		stockMovement := models.StockMovement{
			ProductID:      sellRequest.ProductID,
			ChangeType:     saleData.PaymentMethod,
			QuantityChange: -sellRequest.Quantity,
			Note:           sellRequest.Note,
			CreatedAt:      time.Now(),
		}

		if err := tx.Create(&stockMovement).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Failed to create stock movement for product %d: %v", sellRequest.ProductID, err)
			c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to record stock movement for product %d", sellRequest.ProductID)})
			return
		}

		// Handle credit sale
		if saleData.PaymentMethod == "CREDIT" {
			creditTx := models.CreditTransaction{
				ProductID:    sellRequest.ProductID,
				Name:         saleData.CustomerName,
				PhoneNumber:  saleData.CustomerPhone,
				Quantity:     sellRequest.Quantity,
				CreditAmount: sellRequest.Amount,
				Status:       "unpaid",
			}

			if err := tx.Create(&creditTx).Error; err != nil {
				tx.Rollback()
				utils.ErrorLogger("Failed to create credit transaction for product %d: %v", sellRequest.ProductID, err)
				c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to record credit transaction for product %d", sellRequest.ProductID)})
				return
			}
		}

		// Record sales transaction
		salesTransaction := models.SalesTransaction{
			ProductID:       sellRequest.ProductID,
			Quantity:        sellRequest.Quantity,
			TotalAmount:     sellRequest.Amount,
			PaymentMethod:   saleData.PaymentMethod,
			CustomerName:    saleData.CustomerName,
			CustomerPhone:   saleData.CustomerPhone,
			ReferenceNumber: saleData.ReferenceNumber,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		if err := tx.Create(&salesTransaction).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Failed to create sales transaction for product %d: %v", sellRequest.ProductID, err)
			c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to record sales transaction for product %d", sellRequest.ProductID)})
			return
		}

		// Check for low stock alert
		if inventory.Quantity <= inventory.LowStockThreshold {
			var product models.Product
			if err := tx.First(&product, sellRequest.ProductID).Error; err == nil {
				alert := models.LowStockAlert{
					ProductID:    sellRequest.ProductID,
					AlertMessage: fmt.Sprintf("Product stock is low. Current quantity: %d", inventory.Quantity),
					Resolved:     false,
					CreatedAt:    time.Now(),
				}

				if err := tx.Create(&alert).Error; err != nil {
					utils.ErrorLogger("Failed to create low stock alert for product %d: %v", sellRequest.ProductID, err)
				}
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger("Failed to commit transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to complete sales"})
		return
	}

	utils.InfoLogger("Successfully processed sales")
	c.JSON(200, gin.H{
		"message": "Sales recorded successfully",
	})
}

// Fetch sales history
func (im *SalesManagementHandler) FetchSalesHistory(c *gin.Context) {
	var salesTransactions []struct {
		models.SalesTransaction
		ProductName string `json:"product_name"`
	}

	if err := im.db.Table("sales_transactions").
		Select("sales_transactions.*, products.name as product_name").
		Joins("JOIN products ON sales_transactions.product_id = products.id").
		Find(&salesTransactions).Error; err != nil {
		utils.ErrorLogger("Failed to fetch sales history: %v", err)
		c.JSON(500, gin.H{"error": "Failed to fetch sales history"})
		return
	}

	utils.InfoLogger("Successfully fetched sales history")
	c.JSON(200, salesTransactions)
}
