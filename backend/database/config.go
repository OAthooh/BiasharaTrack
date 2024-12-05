package database

import (
	_ "github.com/mattn/go-sqlite3"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/joho/godotenv"
	"os"
)

type DB struct {
	DB *gorm.DB
}

func Connect() (*DB, error) {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	// Retrieve environment variables
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	endpoint := os.Getenv("DB_ENDPOINT")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	// Construct the connection string (DSN)
	dsn := user + ":" + password + "@tcp(" + endpoint + ":" + port + ")/" + dbName + "?charset=utf8mb4&parseTime=True&loc=Local"

	// Open connection to AWS RDS MySQL instance
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Test the connection
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// Test ping
	err = sqlDB.Ping()
	if err != nil {
		return nil, err
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return &DB{DB: db}, nil
}

func (d *DB) Close() error {
	if d.DB != nil {
		sqlDB, err := d.DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
