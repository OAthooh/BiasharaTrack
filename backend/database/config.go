package database

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	DB *sql.DB
}

func Connect() (*DB, error) {
	// Ensure the directory exists
	dbPath := "./backend/database/storage/"
	if err := os.MkdirAll(dbPath, os.ModePerm); err != nil {
		return nil, err
	}

	// Open the database
	db, err := sql.Open("sqlite3", filepath.Join(dbPath, "database.db"))
	if err != nil {
		return nil, err
	}
	return &DB{DB: db}, nil
}

func (d *DB) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
