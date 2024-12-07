package controllers

import (
	"fmt"

	"github.com/OAthooh/BiasharaTrack.git/models"
	"github.com/OAthooh/BiasharaTrack.git/mpesa"
	"github.com/OAthooh/BiasharaTrack.git/utils"
	"github.com/gin-gonic/gin"
	mpesasdk "github.com/jwambugu/mpesa-golang-sdk"
	"gorm.io/gorm"
)

type MpesaHandler struct {
	db     *gorm.DB
	client *mpesa.MpesaClient
}

func NewMpesaHandler(db *gorm.DB, config mpesa.Config) *MpesaHandler {
	client := mpesa.NewMpesaClient(
		config.ConsumerKey,
		config.ConsumerSecret,
		config.Environment == "sandbox",
	)

	return &MpesaHandler{
		db:     db,
		client: client,
	}
}

// InitiatePayment handles STK push requests
func (h *MpesaHandler) InitiatePayment(c *gin.Context) {
	// Set response headers
	c.Header("Content-Type", "application/json")

	var req struct {
		PhoneNumber string  `json:"phone_number" binding:"required"`
		Amount      float64 `json:"amount" binding:"required"`
		Reference   string  `json:"reference" binding:"required"`
		Description string  `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorLogger("Invalid request payload: %v", err)
		c.JSON(400, gin.H{
			"success": false,
			"message": "Invalid request payload",
			"error":   err.Error(),
		})
		return
	}

	// Validate amount
	if req.Amount <= 0 {
		c.JSON(400, gin.H{
			"success": false,
			"message": "Invalid amount",
			"error":   "Amount must be greater than 0",
		})
		return
	}

	utils.InfoLogger("Initiating STK push for phone: %s, amount: %.2f", req.PhoneNumber, req.Amount)

	// Log the request for debugging
	fmt.Printf("Request data: %+v\n", req)

	resp, err := h.client.InitiateSTKPush(mpesa.STKPushRequest{
		PhoneNumber: req.PhoneNumber,
		Amount:      uint(req.Amount),
		Reference:   req.Reference,
		Description: req.Description,
	})

	if err != nil {
		utils.ErrorLogger("Failed to initiate STK push: %v", err)
		c.JSON(500, gin.H{
			"success": false,
			"message": "Failed to initiate payment",
			"error":   err.Error(),
		})
		return
	}

	// Log the response for debugging
	fmt.Printf("M-PESA Response: %+v\n", resp)

	c.JSON(200, gin.H{
		"success": true,
		"message": "Payment initiated successfully",
		"data": gin.H{
			"CheckoutRequestID":   resp.CheckoutRequestID,
			"MerchantRequestID":   resp.MerchantRequestID,
			"ResponseCode":        resp.ResponseCode,
			"ResponseDescription": resp.ResponseDescription,
			"CustomerMessage":     resp.CustomerMessage,
		},
	})
}

// HandleCallback processes M-Pesa payment callbacks
func (h *MpesaHandler) HandleCallback(c *gin.Context) {
	// Parse the callback data
	callback, err := mpesasdk.UnmarshalSTKPushCallback(c.Request.Body)
	if err != nil {
		utils.ErrorLogger("Failed to unmarshal callback: %v", err)
		c.JSON(400, gin.H{"error": "Invalid callback data"})
		return
	}

	utils.InfoLogger("Received M-Pesa callback: %+v", callback)

	// Extract the STK callback data
	stkCallback := callback.Body.STKCallback

	// Create transaction record
	transaction := models.MpesaTransaction{
		ID:                utils.GenerateUUID(),
		MerchantRequestID: stkCallback.MerchantRequestID,
		CheckoutRequestID: stkCallback.CheckoutRequestID,
		ResultCode:        stkCallback.ResultCode,
		Status:            "PENDING",
	}

	// Process successful transaction
	if stkCallback.ResultCode == 0 {
		transaction.Status = "SUCCESS"

		// Extract transaction details from callback metadata
		for _, item := range stkCallback.CallbackMetadata.Item {
			switch item.Name {
			case "Amount":
				if amount, ok := item.Value.(float64); ok {
					transaction.Amount = amount
				}
			case "MpesaReceiptNumber":
				if receipt, ok := item.Value.(string); ok {
					transaction.ReceiptNumber = receipt
				}
			case "TransactionDate":
				if date, ok := item.Value.(string); ok {
					transaction.TransactionDate = date
				}
			case "PhoneNumber":
				if phone, ok := item.Value.(string); ok {
					transaction.PhoneNumber = phone
				}
			}
		}
	} else {
		transaction.Status = "FAILED"
	}

	// Save transaction to database
	if err := h.db.Create(&transaction).Error; err != nil {
		utils.ErrorLogger("Failed to save transaction: %v", err)
		c.JSON(500, gin.H{"error": "Failed to process callback"})
		return
	}

	utils.InfoLogger("Successfully processed M-Pesa callback for transaction: %s", transaction.ID)
	c.JSON(200, gin.H{
		"status":  "success",
		"message": "Callback processed successfully",
	})
}

// Add this new endpoint
func (h *MpesaHandler) GetPaymentStatus(c *gin.Context) {
	reference := c.Param("reference")

	utils.InfoLogger("Checking payment status for reference: %s", reference)

	var transaction models.MpesaTransaction
	if err := h.db.Where("checkout_request_id = ? OR merchant_request_id = ?",
		reference, reference).First(&transaction).Error; err != nil {
		utils.WarningLogger("Transaction not found for reference: %s", reference)
		c.JSON(200, gin.H{
			"status":  "PENDING",
			"message": "Payment not yet received",
		})
		return
	}

	c.JSON(200, gin.H{
		"status":  transaction.Status,
		"receipt": transaction.ReceiptNumber,
	})
}
