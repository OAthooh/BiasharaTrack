package routes

import (
	"database/sql"

	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
)

func InventoryManagementRoutes(router *gin.Engine, db *sql.DB) {
	im := controllers.NewInventoryManagementHandler(db)

	router.POST("/products", im.CreateProduct)
	router.PUT("/products/:id", im.UpdateProduct)
	router.DELETE("/products/:id", im.DeleteProduct)
	router.GET("/products/:id", im.GetProduct)
	router.GET("/products", im.GetAllProducts)
	router.POST("/sell", im.SellProduct)
}
