package main

import (
	"fmt"
	"log"

	"github.com/OAthooh/BiasharaTrack.git/database"
	"github.com/OAthooh/BiasharaTrack.git/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin to debug mode for development
	// gin.SetMode(gin.DebugMode)

	fmt.Println("Initializing database connection...")
	// Initialize database connection
	db, err := database.Connect()
	if err != nil || db == nil {
		log.Fatal(err)
	}
	defer db.Close()
	fmt.Println("Database connection initialized successfully")

	// Run database migrations
	fmt.Println("Running database migrations...")
	err = db.Migrate()
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	fmt.Println("Database migrations completed successfully")
	// Initialize Gin router with default middleware
	fmt.Println("Initializing Gin router...")
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"} // Frontend dev server
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	router.Use(cors.New(config))

	fmt.Println("Gin router initialized successfully")

	// Register authentication routes
	routes.AuthRoutes(router, db.DB)
	routes.InventoryManagementRoutes(router, db.DB)

	fmt.Println("Server is running on port 8080")
	// Start server on port 8080
	router.Run(":8080")
}
