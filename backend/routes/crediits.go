package routes

import (
	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreditRoutes(router *gin.Engine, db *gorm.DB) {
	cm := controllers.NewCreditManager(db)

	router.GET("/credit-history", cm.GetCreditsHistory)
}
