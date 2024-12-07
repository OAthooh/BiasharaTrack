package controllers

import (
	"net/http"
	"time"

	"github.com/OAthooh/BiasharaTrack.git/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreditManager struct {
	db *gorm.DB
}

func NewCreditManager(db *gorm.DB) *CreditManager {
	return &CreditManager{db: db}
}

func (cm *CreditManager) GetCreditsHistory(c *gin.Context) {
	var transactions []models.CreditTransaction

	if err := cm.db.Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching credit transactions"})
		return
	}

	customerCredits := make(map[uint]*models.CreditCustomer)

	for _, transaction := range transactions {
		customerID := transaction.ID
		if _, exists := customerCredits[customerID]; !exists {
			customerCredits[customerID] = &models.CreditCustomer{
				ID:              string(rune(customerID)),
				Name:            transaction.Name,
				Phone:           transaction.PhoneNumber,
				TotalCredit:     transaction.CreditAmount,
				BalanceDue:      transaction.CreditAmount,
				LastPaymentDate: time.Time{},
				Status:          "active",
			}
		}

		customer := customerCredits[customerID]
		customer.TotalCredit += transaction.CreditAmount
		if transaction.Status == "PENDING" {
			customer.BalanceDue += transaction.CreditAmount
		}
		if transaction.Status == "PAID" && transaction.CreatedAt.After(customer.LastPaymentDate) {
			customer.LastPaymentDate = transaction.CreatedAt
		}
		if transaction.Status == "CANCELLED" {
			customer.Status = "overdue"
		}
	}

	creditCustomers := make([]models.CreditCustomer, 0, len(customerCredits))
	for _, customer := range customerCredits {
		creditCustomers = append(creditCustomers, *customer)
	}

	c.JSON(http.StatusOK, creditCustomers)
}
