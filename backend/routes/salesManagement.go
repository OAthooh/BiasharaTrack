package routes

import (
	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SalesManagementRoutes(router *gin.Engine, db *gorm.DB) {
	sm := controllers.NewSalesManagementHandler(db)

	router.POST("/record-sale", sm.SellProducts)
	router.GET("/sales-history", sm.FetchSalesHistory)
}
