package routes

import (
	"database/sql"

	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
)

func InventoryManagementRoutes(router *gin.Engine, db *sql.DB) {
	im := controllers.NewInventoryManagementHandler(db)

	router.Static("/uploads", "./uploads")

	router.POST("/create-product", im.CreateProduct)
	router.PUT("/update-product/:id", im.UpdateProduct)
	router.DELETE("/delete-product/:id", im.DeleteProduct)
	router.GET("/get-product/:id", im.GetProduct)
	router.GET("/get-all-products", im.GetAllProducts)
	router.POST("/sell-product", im.SellProduct)
	router.GET("/get-low-stock-alerts", im.GetLowStockAlerts)
	router.GET("/lookup-barcode/", im.LookupBarcode)
}
