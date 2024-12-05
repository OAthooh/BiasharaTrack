package controllers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/OAthooh/BiasharaTrack.git/models"
	"github.com/OAthooh/BiasharaTrack.git/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type InventoryManagementHandler struct {
	db *gorm.DB
}

func NewInventoryManagementHandler(db *gorm.DB) *InventoryManagementHandler {
	return &InventoryManagementHandler{db: db}
}

func (im *InventoryManagementHandler) CreateProduct(c *gin.Context) {
	// Set a reasonable max size for the entire form (including file)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		utils.ErrorLogger("Failed to parse multipart form: %v", err)
		c.JSON(400, gin.H{"error": "Invalid form data"})
		return
	}

	// Get the file from form
	file, header, err := c.Request.FormFile("image")
	if !isAllowedImageType(file) {
		utils.ErrorLogger("Invalid file type uploaded")
		c.JSON(400, gin.H{"error": "Invalid file type. Only JPEG, PNG and GIF are allowed"})
		return
	}
	var imagePath string
	if err == nil {
		defer file.Close()

		// Create the uploads directory if it doesn't exist
		uploadsDir := "uploads/products"
		if err := os.MkdirAll(uploadsDir, 0o755); err != nil {
			utils.ErrorLogger("Failed to create uploads directory: %v", err)
			c.JSON(500, gin.H{"error": "Failed to process image"})
			return
		}

		// Generate a unique filename
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
		imagePath = filepath.Join(uploadsDir, filename)

		// Create the file
		dst, err := os.Create(imagePath)
		if err != nil {
			utils.ErrorLogger("Failed to create file: %v", err)
			c.JSON(500, gin.H{"error": "Failed to save image"})
			return
		}
		defer dst.Close()

		// Copy the uploaded file to the destination file
		if _, err := io.Copy(dst, file); err != nil {
			utils.ErrorLogger("Failed to copy file: %v", err)
			c.JSON(500, gin.H{"error": "Failed to save image"})
			return
		}

		// Convert filepath to URL path
		imagePath = "/uploads/products/" + filename
	}

	// Parse other form fields
	product := models.Product{
		Name:        c.Request.FormValue("name"),
		Description: c.Request.FormValue("description"),
		Category:    c.Request.FormValue("category"),
		Barcode:     c.Request.FormValue("barcode"),
		PhotoPath:   imagePath,
	}

	// Parse price
	if price, err := strconv.ParseFloat(c.Request.FormValue("price"), 64); err == nil {
		product.Price = price
	} else {
		utils.ErrorLogger("Invalid price format: %v", err)
		c.JSON(400, gin.H{"error": "Invalid price format"})
		return
	}

	// Parse quantity
	var quantity int
	if q, err := strconv.Atoi(c.Request.FormValue("quantity")); err == nil {
		if q < 0 {
			c.JSON(400, gin.H{"error": "Quantity must be non-negative"})
			return
		}
		quantity = q
	} else {
		utils.ErrorLogger("Invalid quantity format: %v", err)
		c.JSON(400, gin.H{"error": "Invalid quantity format"})
		return
	}

	// Parse threshold
	var threshold int
	if t, err := strconv.Atoi(c.Request.FormValue("low_stock_threshold")); err == nil {
		if t < 0 {
			c.JSON(400, gin.H{"error": "Threshold must be non-negative"})
			return
		}
		threshold = t
	} else {
		utils.ErrorLogger("Invalid threshold format: %v", err)
		c.JSON(400, gin.H{"error": "Invalid threshold format"})
		return
	}

	// Start transaction
	tx := im.db.Begin()
	if tx.Error != nil {
		utils.ErrorLogger("Failed to start transaction: %v", tx.Error)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create product
	if err := tx.Create(&product).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Failed to create product: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create product"})
		return
	}

	// Create inventory record
	inventory := models.Inventory{
		ProductID:         product.ID,
		Quantity:          quantity,
		LowStockThreshold: threshold,
		LastUpdated:       time.Now(),
	}

	if err := tx.Create(&inventory).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Failed to create inventory: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create inventory"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger("Failed to commit transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create product"})
		return
	}

	// Check if initial quantity is below threshold and create alert if needed
	if quantity <= threshold {
		alert := models.LowStockAlert{
			ProductID: product.ID,
			AlertMessage: fmt.Sprintf("Low stock alert for %s: %d units remaining (threshold: %d)",
				product.Name, quantity, threshold),
			Resolved:  false,
			CreatedAt: time.Now(),
		}

		if err := im.db.Create(&alert).Error; err != nil {
			utils.ErrorLogger("Failed to create low stock alert: %v", err)
		}
	}

	c.JSON(200, gin.H{
		"success": true,
		"data":    product,
	})
}

func (im *InventoryManagementHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorLogger("Failed to parse update product request: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

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

	// Update product
	product := models.Product{}
	if err := tx.First(&product, id).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Product not found: %v", err)
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}

	// Update fields
	if name, ok := input["name"].(string); ok {
		product.Name = name
	}
	if description, ok := input["description"].(string); ok {
		product.Description = description
	}
	if category, ok := input["category"].(string); ok {
		product.Category = category
	}
	if price, ok := input["price"].(float64); ok {
		product.Price = price
	}
	if barcode, ok := input["barcode"].(string); ok {
		product.Barcode = barcode
	}
	if photoPath, ok := input["photo_path"].(string); ok {
		product.PhotoPath = photoPath
	}

	product.UpdatedAt = time.Now()

	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Failed to update product: %v", err)
		c.JSON(500, gin.H{"error": "Failed to update product"})
		return
	}

	// Handle quantity changes
	if quantityChange, ok := input["quantity_change"].(float64); ok {
		stockMovement := models.StockMovement{
			ProductID:      product.ID,
			ChangeType:     input["change_type"].(string),
			QuantityChange: int(quantityChange),
			Note:           "Product details updated",
			CreatedAt:      time.Now(),
		}

		if err := tx.Create(&stockMovement).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Failed to create stock movement: %v", err)
			c.JSON(500, gin.H{"error": "Failed to record stock movement"})
			return
		}

		// Update inventory
		var inventory models.Inventory
		if err := tx.Where("product_id = ?", product.ID).First(&inventory).Error; err != nil {
			inventory = models.Inventory{
				ProductID:   product.ID,
				Quantity:    int(quantityChange),
				LastUpdated: time.Now(),
			}
			if err := tx.Create(&inventory).Error; err != nil {
				tx.Rollback()
				utils.ErrorLogger("Failed to create inventory: %v", err)
				c.JSON(500, gin.H{"error": "Failed to update inventory"})
				return
			}
		} else {
			inventory.Quantity += int(quantityChange)
			inventory.LastUpdated = time.Now()
			if err := tx.Save(&inventory).Error; err != nil {
				tx.Rollback()
				utils.ErrorLogger("Failed to update inventory: %v", err)
				c.JSON(500, gin.H{"error": "Failed to update inventory"})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger("Failed to commit transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to update product"})
		return
	}

	// Check for low stock alert
	var inventory models.Inventory
	if err := im.db.Where("product_id = ?", product.ID).First(&inventory).Error; err == nil {
		if inventory.Quantity <= inventory.LowStockThreshold {
			alert := models.LowStockAlert{
				ProductID: product.ID,
				AlertMessage: fmt.Sprintf("Low stock alert for %s: Current quantity (%d) is at or below threshold (%d)",
					product.Name, inventory.Quantity, inventory.LowStockThreshold),
				Resolved:  false,
				CreatedAt: time.Now(),
			}
			if err := im.db.Create(&alert).Error; err != nil {
				utils.ErrorLogger("Failed to create low stock alert: %v", err)
			}
		}
	}

	utils.InfoLogger("Successfully updated product %s", id)
	c.JSON(200, gin.H{"message": "Product updated successfully"})
}

func (im *InventoryManagementHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	if err := im.db.Delete(&models.Product{}, id).Error; err != nil {
		utils.ErrorLogger("Failed to delete product %s: %v", id, err)
		c.JSON(500, gin.H{"error": "Failed to delete product"})
		return
	}

	utils.InfoLogger("Successfully deleted product %s", id)
	c.JSON(200, gin.H{"message": "Product deleted successfully"})
}

func (im *InventoryManagementHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	var inventory models.Inventory

	if err := im.db.First(&product, id).Error; err != nil {
		utils.WarningLogger("Product not found: %v", err)
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}

	if err := im.db.Where("product_id = ?", id).First(&inventory).Error; err != nil {
		inventory.Quantity = 0
	}

	response := gin.H{
		"product":  product,
		"quantity": inventory.Quantity,
	}

	utils.InfoLogger("Successfully fetched product %s", id)
	c.JSON(200, response)
}

func (im *InventoryManagementHandler) GetAllProducts(c *gin.Context) {
	var products []models.Product
	var result []gin.H

	if err := im.db.Find(&products).Error; err != nil {
		utils.ErrorLogger("Failed to fetch products: %v", err)
		c.JSON(500, gin.H{"error": "Failed to get products"})
		return
	}

	for _, product := range products {
		var inventory models.Inventory
		if err := im.db.Where("product_id = ?", product.ID).First(&inventory).Error; err != nil {
			inventory.Quantity = 0
		}

		result = append(result, gin.H{
			"product":  product,
			"quantity": inventory.Quantity,
		})
	}

	utils.InfoLogger("Successfully fetched all products")
	c.JSON(200, result)
}

func (im *InventoryManagementHandler) SellProduct(c *gin.Context) {
	var sellRequest struct {
		ProductID uint    `json:"product_id" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required"`
		Note      string  `json:"note"`
		SaleType  string  `json:"sale_type"` // "CASH" or "CREDIT"
		Name      string  `json:"name"`      // Required for credit sales
		Phone     string  `json:"phone"`     // Optional for credit sales
		Amount    float64 `json:"amount"`    // Required for credit sales
	}

	if err := c.ShouldBindJSON(&sellRequest); err != nil {
		utils.ErrorLogger("Failed to parse sell request: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate credit sale requirements
	if sellRequest.SaleType == "CREDIT" {
		if sellRequest.Name == "" || sellRequest.Amount == 0 {
			utils.WarningLogger("Incomplete credit sale request")
			c.JSON(400, gin.H{"error": "Name and amount are required for credit sales"})
			return
		}
	}

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

	// Get current inventory
	var inventory models.Inventory
	if err := tx.Where("product_id = ?", sellRequest.ProductID).First(&inventory).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Product not found in inventory: %v", err)
		c.JSON(404, gin.H{"error": "Product not found in inventory"})
		return
	}

	// Check if we have enough stock
	if inventory.Quantity < sellRequest.Quantity {
		tx.Rollback()
		utils.WarningLogger("Insufficient stock. Requested: %d, Available: %d",
			sellRequest.Quantity, inventory.Quantity)
		c.JSON(400, gin.H{"error": "Insufficient stock"})
		return
	}

	// Update inventory
	inventory.Quantity -= sellRequest.Quantity
	inventory.LastUpdated = time.Now()
	if err := tx.Save(&inventory).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Failed to update inventory: %v", err)
		c.JSON(500, gin.H{"error": "Failed to update inventory"})
		return
	}

	// Record stock movement
	stockMovement := models.StockMovement{
		ProductID:      sellRequest.ProductID,
		ChangeType:     sellRequest.SaleType,
		QuantityChange: -sellRequest.Quantity,
		Note:           sellRequest.Note,
		CreatedAt:      time.Now(),
	}

	if err := tx.Create(&stockMovement).Error; err != nil {
		tx.Rollback()
		utils.ErrorLogger("Failed to create stock movement: %v", err)
		c.JSON(500, gin.H{"error": "Failed to record stock movement"})
		return
	}

	// Handle credit sale
	if sellRequest.SaleType == "CREDIT" {
		creditTx := models.CreditTransaction{
			ProductID:    sellRequest.ProductID,
			Name:         sellRequest.Name,
			PhoneNumber:  sellRequest.Phone,
			Quantity:     sellRequest.Quantity,
			CreditAmount: sellRequest.Amount,
			Status:       "unpaid",
		}

		if err := tx.Create(&creditTx).Error; err != nil {
			tx.Rollback()
			utils.ErrorLogger("Failed to create credit transaction: %v", err)
			c.JSON(500, gin.H{"error": "Failed to record credit transaction"})
			return
		}
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
				utils.ErrorLogger("Failed to create low stock alert: %v", err)
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		utils.ErrorLogger("Failed to commit transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to complete sale"})
		return
	}

	utils.InfoLogger("Successfully sold %d units of product %d", sellRequest.Quantity, sellRequest.ProductID)
	c.JSON(200, gin.H{
		"message":      "Sale recorded successfully",
		"new_quantity": inventory.Quantity,
	})
}

func isAllowedImageType(file multipart.File) bool {
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return false
	}

	file.Seek(0, 0)
	contentType := http.DetectContentType(buffer)

	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}

	return allowedTypes[contentType]
}

func (im *InventoryManagementHandler) GetLowStockAlerts(c *gin.Context) {
	var alerts []struct {
		models.LowStockAlert
		ProductName     string `json:"product_name"`
		CurrentQuantity int    `json:"current_quantity"`
		StockThreshold  int    `json:"stock_threshold"`
	}

	if err := im.db.Table("low_stock_alerts").
		Select("low_stock_alerts.*, products.name as product_name, inventory.quantity as current_quantity, inventory.low_stock_threshold as stock_threshold").
		Joins("JOIN products ON low_stock_alerts.product_id = products.id").
		Joins("JOIN inventory ON products.id = inventory.product_id").
		Order("low_stock_alerts.created_at DESC").
		Find(&alerts).Error; err != nil {
		utils.ErrorLogger("Failed to fetch alerts: %v", err)
		c.JSON(500, gin.H{"error": "Failed to fetch alerts"})
		return
	}

	c.JSON(200, alerts)
}

func (im *InventoryManagementHandler) LookupBarcode(c *gin.Context) {
	barcode := c.Query("barcode")
	if barcode == "" {
		c.JSON(400, gin.H{"error": "Barcode is required"})
		return
	}

	utils.InfoLogger("Looking up barcode: %s", barcode)

	// Mock data for testing
	mockProducts := map[string]struct {
		Name        string
		Description string
		Price       float64
	}{
		"123456789012": {
			Name:        "Test Product 1",
			Description: "This is a test product description",
			Price:       19.99,
		},
		"987654321098": {
			Name:        "Test Product 2",
			Description: "Another test product description",
			Price:       29.99,
		},
		"456789123456": {
			Name:        "Test Product 3",
			Description: "A third test product description",
			Price:       9.99,
		},
	}

	product := mockProducts["987654321098"]

	c.JSON(200, gin.H{
		"success": true,
		"data":    product,
	})
}
