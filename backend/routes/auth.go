package routes

import (
	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthRoutes sets up authentication related routes for the application
func AuthRoutes(router *gin.Engine, db *gorm.DB) {
	auth := controllers.NewAuthHandler(db)

	router.POST("/login", auth.Login)
	router.POST("/register", auth.Register)
	router.GET("/verify-token", auth.VerifyToken)
}
