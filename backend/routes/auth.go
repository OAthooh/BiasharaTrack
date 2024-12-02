package routes

import (
	"database/sql"

	"github.com/OAthooh/BiasharaTrack.git/controllers"
	"github.com/gin-gonic/gin"
)

// AuthRoutes sets up authentication related routes for the application
func AuthRoutes(router *gin.Engine, db *sql.DB) {
	auth := controllers.NewAuthHandler(db)

	router.POST("/login", auth.Login)
	router.POST("/register", auth.Register)
	router.GET("/verify-token", auth.VerifyToken)
}
