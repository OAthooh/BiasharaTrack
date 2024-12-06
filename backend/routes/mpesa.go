// mpesa.go
package routes

import (
	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/OAthooh/BiasharaTrack.git/mpesa"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"os"
	"fmt"
)

func MpesaRoutes(router *gin.Engine, db *gorm.DB) {
	fmt.Println("Registering M-Pesa routes...")
	
	config := mpesa.Config{
		ConsumerKey:       os.Getenv("MPESA_CONSUMER_KEY"),
		ConsumerSecret:    os.Getenv("MPESA_CONSUMER_SECRET"),
		BusinessShortCode: os.Getenv("MPESA_BUSINESS_SHORTCODE"),
		PassKey:           os.Getenv("MPESA_PASSKEY"),
		CallbackURL:       os.Getenv("CALLBACK_URL") + "/api/mpesa/callback",
		Environment:       os.Getenv("MPESA_ENVIRONMENT"),
	}

	handler := controllers.NewMpesaHandler(db, config)

	mpesaGroup := router.Group("/api/mpesa")
	{
		mpesaGroup.POST("/initiate", handler.InitiatePayment)
		mpesaGroup.POST("/callback", handler.HandleCallback)
	}
	
	fmt.Println("M-Pesa routes registered successfully")
} 