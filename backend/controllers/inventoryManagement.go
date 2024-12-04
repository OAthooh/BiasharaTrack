package controllers

import (
	"database/sql"
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
)

type InventoryManagementHandler struct {
	db *sql.DB
}

func NewInventoryManagementHandler(db *sql.DB) *InventoryManagementHandler {
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
	tx, err := im.db.Begin()
	if err != nil {
		utils.ErrorLogger("Failed to start transaction: %v", err)
		c.JSON(500, gin.H{"error": "Internal server error"})
		return
	}
	defer tx.Rollback()

	// Set timestamps
	now := time.Now()
	product.CreatedAt = now
	product.UpdatedAt = now

	// Insert product
	result, err := tx.Exec(`
		INSERT INTO Products (
			name, description, category, price, barcode, 
			photo_path, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		product.Name, product.Description, product.Category,
		product.Price, product.Barcode, product.PhotoPath,
		product.CreatedAt, product.UpdatedAt,
	)
	if err != nil {
		utils.ErrorLogger("Failed to insert product: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create product"})
		return
	}

	// Get the ID of the newly created product
	productID, err := result.LastInsertId()
	if err != nil {
		utils.ErrorLogger("Failed to get last insert ID: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create product"})
		return
	}

	// Insert initial inventory record with threshold
	_, err = tx.Exec(`
		INSERT INTO Inventory (
			product_id, quantity, low_stock_threshold, last_updated
		) VALUES (?, ?, ?, ?)`,
		productID, quantity, threshold, now,
	)
	if err != nil {
		utils.ErrorLogger("Failed to insert inventory record: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create inventory record"})
		return
	}

	if err := tx.Commit(); err != nil {
		utils.ErrorLogger("Failed to commit transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to create product"})
		return
	}

	product.ID = int(productID)
	// Check if initial quantity is below threshold and create alert if needed
	if quantity <= threshold {
		_, err = im.db.Exec(`
			INSERT INTO LowStockAlerts (
				product_id, alert_message, resolved, created_at
			) VALUES (?, ?, ?, ?)`,
			productID,
			fmt.Sprintf("Low stock alert for %s: %d units remaining (threshold: %d)",
				product.Name, quantity, threshold),
			false,
			now,
		)
		if err != nil {
			utils.ErrorLogger("Failed to create low stock alert: %v", err)
			c.JSON(500, gin.H{"error": "Failed to create low stock alert"})
			return
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

	// Start a transaction
	tx, err := im.db.Begin()
	if err != nil {
		utils.ErrorLogger("Failed to start transaction for product update: %v", err)
		c.JSON(500, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Build the update query dynamically
	query := "UPDATE Products SET updated_at=?"
	args := []interface{}{time.Now()}

	if name, ok := input["name"]; ok {
		query += ", name=?"
		args = append(args, name)
	}
	if description, ok := input["description"]; ok {
		query += ", description=?"
		args = append(args, description)
	}
	if category, ok := input["category"]; ok {
		query += ", category=?"
		args = append(args, category)
	}
	if price, ok := input["price"]; ok {
		query += ", price=?"
		args = append(args, price)
	}
	if barcode, ok := input["barcode"]; ok {
		query += ", barcode=?"
		args = append(args, barcode)
	}
	if photoPath, ok := input["photo_path"]; ok {
		query += ", photo_path=?"
		args = append(args, photoPath)
	}

	query += " WHERE id=?"
	args = append(args, id)

	// Execute the update query
	result, err := tx.Exec(query, args...)
	if err != nil {
		utils.ErrorLogger("Failed to update product %s: %v", id, err)
		c.JSON(500, gin.H{"error": "Failed to update product"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WarningLogger("Attempted to update non-existent product with ID %s", id)
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}

	// Get change type and quantity change from input
	changeType, ok := input["change_type"].(string)
	if !ok {
		utils.ErrorLogger("Change type missing in update request for product %s", id)
		c.JSON(400, gin.H{"error": "Change type is required"})
		return
	}

	quantityChange := 0
	if qc, ok := input["quantity_change"].(float64); ok {
		quantityChange = int(qc)
	}

	// Record stock movement
	productID, err := strconv.Atoi(id)
	if err != nil {
		utils.ErrorLogger("Invalid product ID format: %s", id)
		c.JSON(400, gin.H{"error": "Invalid product ID"})
		return
	}
	stockMovement := models.StockMovement{
		ProductID:      productID,
		ChangeType:     changeType,
		QuantityChange: quantityChange,
		Note:           "Product details updated",
		CreatedAt:      time.Now(),
	}

	_, err = tx.Exec(`
		INSERT INTO StockMovements (product_id, change_type, quantity_change, note, created_at)
		VALUES (?, ?, ?, ?, ?)`,
		stockMovement.ProductID, stockMovement.ChangeType, stockMovement.QuantityChange, stockMovement.Note, stockMovement.CreatedAt)
	if err != nil {
		utils.ErrorLogger("Failed to record stock movement for product %d: %v", productID, err)
		c.JSON(500, gin.H{"error": "Failed to record stock movement"})
		return
	}

	// Update inventory quantity if quantity change is provided
	if quantityChange != 0 {
		_, err = tx.Exec(`
			INSERT INTO Inventory (product_id, quantity)
			VALUES (?, ?)
			ON CONFLICT(product_id) DO UPDATE SET
			quantity = Inventory.quantity + ?,
			last_updated = CURRENT_TIMESTAMP`,
			productID, quantityChange, quantityChange)
		if err != nil {
			utils.ErrorLogger("Failed to update inventory for product %d: %v", productID, err)
			c.JSON(500, gin.H{"error": "Failed to update inventory"})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		utils.ErrorLogger("Failed to commit transaction for product update: %v", err)
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}
	// Check if quantity is below threshold and create alert if needed
	var currentQuantity, threshold int
	err = im.db.QueryRow(`
		SELECT quantity, low_stock_threshold 
		FROM Inventory 
		WHERE product_id = ?`, productID).Scan(&currentQuantity, &threshold)
	if err != nil && err != sql.ErrNoRows {
		utils.ErrorLogger("Failed to check inventory levels for product %d: %v", productID, err)
	} else if err == nil && currentQuantity <= threshold {
		// Get product name for alert message
		var productName string
		err = im.db.QueryRow("SELECT name FROM Products WHERE id = ?", productID).Scan(&productName)
		if err == nil {
			alertMsg := fmt.Sprintf("Low stock alert for %s: Current quantity (%d) is at or below threshold (%d)",
				productName, currentQuantity, threshold)

			_, err = im.db.Exec(`
				INSERT INTO LowStockAlerts (product_id, alert_message, resolved, created_at)
				VALUES (?, ?, false, CURRENT_TIMESTAMP)`,
				productID, alertMsg)
			if err != nil {
				utils.ErrorLogger("Failed to create low stock alert for product %d: %v", productID, err)
			}
		}
	}

	utils.InfoLogger("Successfully updated product %d", productID)
	c.JSON(200, gin.H{"message": "Product updated successfully"})
}

func (im *InventoryManagementHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	result, err := im.db.Exec("DELETE FROM Products WHERE id=?", id)
	if err != nil {
		utils.ErrorLogger("Failed to delete product %s: %v", id, err)
		c.JSON(500, gin.H{"error": "Failed to delete product"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WarningLogger("Attempted to delete non-existent product with ID %s", id)
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}

	utils.InfoLogger("Successfully deleted product %s", id)
	c.JSON(200, gin.H{"message": "Product deleted successfully"})
}

func (im *InventoryManagementHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	var quantity sql.NullInt64
	err := im.db.QueryRow(`
		SELECT p.id, p.name, p.description, p.category, p.price, p.barcode, p.photo_path, 
		       p.created_at, p.updated_at, COALESCE(i.quantity, 0) as quantity
		FROM Products p
		LEFT JOIN Inventory i ON p.id = i.product_id 
		WHERE p.id=?`, id).Scan(
		&product.ID, &product.Name, &product.Description, &product.Category,
		&product.Price, &product.Barcode, &product.PhotoPath, &product.CreatedAt,
		&product.UpdatedAt, &quantity)

	if err == sql.ErrNoRows {
		utils.WarningLogger("Attempted to fetch non-existent product with ID %s", id)
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}
	if err != nil {
		utils.ErrorLogger("Failed to fetch product %s: %v", id, err)
		c.JSON(500, gin.H{"error": "Failed to get product"})
		return
	}

	response := gin.H{
		"product":  product,
		"quantity": quantity.Int64,
	}

	utils.InfoLogger("Successfully fetched product %s", id)
	c.JSON(200, response)
}

func (im *InventoryManagementHandler) GetAllProducts(c *gin.Context) {
	rows, err := im.db.Query(`
		SELECT p.id, p.name, p.description, p.category, p.price, p.barcode, p.photo_path, 
		       p.created_at, p.updated_at, COALESCE(i.quantity, 0) as quantity
		FROM Products p
		LEFT JOIN Inventory i ON p.id = i.product_id`)
	if err != nil {
		utils.ErrorLogger("Failed to fetch all products: %v", err)
		c.JSON(500, gin.H{"error": "Failed to get products"})
		return
	}
	defer rows.Close()

	var products []gin.H
	for rows.Next() {
		var product models.Product
		var quantity sql.NullInt64
		err := rows.Scan(
			&product.ID, &product.Name, &product.Description, &product.Category,
			&product.Price, &product.Barcode, &product.PhotoPath, &product.CreatedAt,
			&product.UpdatedAt, &quantity)
		if err != nil {
			utils.ErrorLogger("Failed to parse product data: %v", err)
			c.JSON(500, gin.H{"error": "Failed to parse product data"})
			return
		}

		productWithQuantity := gin.H{
			"product":  product,
			"quantity": quantity.Int64,
		}
		products = append(products, productWithQuantity)
	}

	if err = rows.Err(); err != nil {
		utils.ErrorLogger("Error while iterating products: %v", err)
		c.JSON(500, gin.H{"error": "Error while iterating products"})
		return
	}

	utils.InfoLogger("Successfully fetched all products")
	c.JSON(200, products)
}

func (im *InventoryManagementHandler) SellProduct(c *gin.Context) {
	var sellRequest struct {
		ProductID int     `json:"product_id" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required"`
		Note      string  `json:"note"`
		SaleType  string  `json:"sale_type"` // "CASH" or "CREDIT"
		Name      string  `json:"name"`      // Required for credit sales
		Phone     string  `json:"phone"`     // Optional for credit sales
		Amount    float64 `json:"amount"`    // Required for credit sales
	}

	if err := c.ShouldBindJSON(&sellRequest); err != nil {
		utils.ErrorLogger("Failed to parse sell product request: %v", err)
		c.JSON(400, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate credit sale requirements
	if sellRequest.SaleType == "CREDIT" {
		if sellRequest.Name == "" || sellRequest.Amount == 0 {
			utils.WarningLogger("Incomplete credit sale request for product %d", sellRequest.ProductID)
			c.JSON(400, gin.H{"error": "Name and amount are required for credit sales"})
			return
		}
	}

	// Start transaction
	tx, err := im.db.Begin()
	if err != nil {
		utils.ErrorLogger("Failed to start transaction for product sale: %v", err)
		c.JSON(500, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Get current inventory
	var currentQuantity, lowStockThreshold int
	err = tx.QueryRow(`
		SELECT quantity, low_stock_threshold 
		FROM Inventory 
		WHERE product_id = ?`, sellRequest.ProductID).Scan(&currentQuantity, &lowStockThreshold)
	if err != nil {
		utils.ErrorLogger("Product %d not found in inventory: %v", sellRequest.ProductID, err)
		c.JSON(404, gin.H{"error": "Product not found in inventory"})
		return
	}

	// Check if we have enough stock
	if currentQuantity < sellRequest.Quantity {
		utils.WarningLogger("Insufficient stock for product %d. Requested: %d, Available: %d",
			sellRequest.ProductID, sellRequest.Quantity, currentQuantity)
		c.JSON(400, gin.H{"error": "Insufficient stock"})
		return
	}

	// Update inventory
	newQuantity := currentQuantity - sellRequest.Quantity
	_, err = tx.Exec(`
		UPDATE Inventory 
		SET quantity = ?, last_updated = CURRENT_TIMESTAMP 
		WHERE product_id = ?`, newQuantity, sellRequest.ProductID)
	if err != nil {
		utils.ErrorLogger("Failed to update inventory for product %d: %v", sellRequest.ProductID, err)
		c.JSON(500, gin.H{"error": "Failed to update inventory"})
		return
	}

	// Record stock movement
	_, err = tx.Exec(`
		INSERT INTO StockMovements (product_id, change_type, quantity_change, note)
		VALUES (?, ?, ?, ?)`,
		sellRequest.ProductID, sellRequest.SaleType, -sellRequest.Quantity, sellRequest.Note)
	if err != nil {
		utils.ErrorLogger("Failed to record stock movement for product %d: %v", sellRequest.ProductID, err)
		c.JSON(500, gin.H{"error": "Failed to record stock movement"})
		return
	}

	// Record additional stock movement for credit/cash sale type
	_, err = tx.Exec(`
		INSERT INTO StockMovements (product_id, change_type, quantity_change, note)
		VALUES (?, ?, ?, ?)`,
		sellRequest.ProductID, sellRequest.SaleType, -sellRequest.Quantity,
		fmt.Sprintf("%s sale of %d units", sellRequest.SaleType, sellRequest.Quantity))
	if err != nil {
		utils.ErrorLogger("Failed to record sale type stock movement for product %d: %v", sellRequest.ProductID, err)
		c.JSON(500, gin.H{"error": "Failed to record sale type stock movement"})
		return
	}

	// If it's a credit sale, record it in CreditTransactions
	if sellRequest.SaleType == "CREDIT" {
		_, err = tx.Exec(`
			INSERT INTO CreditTransactions (product_id, name, phone_number, quantity, credit_amount, status)
			VALUES (?, ?, ?, ?, ?, 'unpaid')`,
			sellRequest.ProductID, sellRequest.Name, sellRequest.Phone, sellRequest.Quantity, sellRequest.Amount)
		if err != nil {
			utils.ErrorLogger("Failed to record credit transaction for product %d: %v", sellRequest.ProductID, err)
			c.JSON(500, gin.H{"error": "Failed to record credit transaction"})
			return
		}
	}

	// Check if we need to create a low stock alert
	if newQuantity <= lowStockThreshold {
		_, err = tx.Exec(`
			INSERT INTO LowStockAlerts (product_id, alert_message, resolved)
			VALUES (?, ?, FALSE)`,
			sellRequest.ProductID,
			fmt.Sprintf("Product stock is low. Current quantity: %d", newQuantity))
		if err != nil {
			utils.ErrorLogger("Failed to create low stock alert for product %d: %v", sellRequest.ProductID, err)
			c.JSON(500, gin.H{"error": "Failed to create low stock alert"})
			return
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		utils.ErrorLogger("Failed to commit transaction for product sale: %v", err)
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}

	utils.InfoLogger("Successfully sold %d units of product %d", sellRequest.Quantity, sellRequest.ProductID)
	c.JSON(200, gin.H{
		"message":      "Sale recorded successfully",
		"new_quantity": newQuantity,
	})
}

// Add this function to your controller
func isAllowedImageType(file multipart.File) bool {
	// Read the first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return false
	}

	// Seek back to start of file
	file.Seek(0, 0)

	// Check content type
	contentType := http.DetectContentType(buffer)

	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}

	return allowedTypes[contentType]
}

func (im *InventoryManagementHandler) GetLowStockAlerts(c *gin.Context) {
	
	// Query to get low stock alerts with product details
	rows, err := im.db.Query(`
		SELECT 
			a.id,
			a.product_id,
			a.alert_message,
			a.resolved,
			a.created_at,
			p.name as product_name,
			i.quantity as current_quantity,
			i.low_stock_threshold
		FROM LowStockAlerts a
		JOIN Products p ON a.product_id = p.id 
		JOIN Inventory i ON p.id = i.product_id
		ORDER BY a.created_at DESC`)
	if err != nil {
		utils.ErrorLogger("Failed to fetch low stock alerts: %v", err)
		c.JSON(500, gin.H{"error": "Failed to fetch alerts"})
		return
	}
	defer rows.Close()

	var alerts []gin.H
	for rows.Next() {
		var (
			id             int
			productID      int
			alertMessage   string
			resolved       bool
			createdAt      time.Time
			productName    string
			quantity       int
			stockThreshold int
		)

		err := rows.Scan(&id, &productID, &alertMessage, &resolved, &createdAt,
			&productName, &quantity, &stockThreshold)
		if err != nil {
			utils.ErrorLogger("Error scanning alert row: %v", err)
			continue
		}

		alerts = append(alerts, gin.H{
			"id":               id,
			"product_id":       productID,
			"product_name":     productName,
			"alert_message":    alertMessage,
			"resolved":         resolved,
			"created_at":       createdAt,
			"current_quantity": quantity,
			"stock_threshold":  stockThreshold,
		})
	}

	if err = rows.Err(); err != nil {
		utils.ErrorLogger("Error iterating alert rows: %v", err)
		c.JSON(500, gin.H{"error": "Error processing alerts"})
		return
	}

	c.JSON(200, alerts)
}
