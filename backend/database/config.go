package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	DB *sql.DB
}

func Connect() (*DB, error) {
	// Ensure the directory exists
	dbPath := "./database/storage/"
	if err := os.MkdirAll(dbPath, os.ModePerm); err != nil {
		return nil, err
	}

	// Open the database with WAL journal mode and timeouts
	db, err := sql.Open("sqlite3", filepath.Join(dbPath, "database.db")+"?_journal=WAL&_timeout=5000&_busy_timeout=5000")
	if err != nil {
		return nil, err
	}

	// Set connection pool settings
	db.SetMaxOpenConns(1) // Limit to one connection to prevent locks
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	// Execute PRAGMA statements for better concurrency
	pragmas := []string{
		"PRAGMA journal_mode=WAL",   // Write-Ahead Logging
		"PRAGMA busy_timeout=5000",  // Wait up to 5s when database is locked
		"PRAGMA synchronous=NORMAL", // Faster than FULL, still safe
	}

	for _, pragma := range pragmas {
		_, err := db.Exec(pragma)
		if err != nil {
			db.Close() // Clean up before returning error
			return nil, fmt.Errorf("failed to set pragma %s: %v", pragma, err)
		}
	}

	return &DB{DB: db}, nil
}

func (d *DB) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
