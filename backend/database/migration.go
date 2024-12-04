package database

func (d *DB) Migrate() error {
	// Create authentication table if it doesn't exist
	query := `
		CREATE TABLE IF NOT EXISTS auth (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			full_name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS Products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			category TEXT,
			price REAL NOT NULL,
			barcode TEXT UNIQUE,
			photo_path TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS Inventory (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL UNIQUE,
			quantity INTEGER NOT NULL DEFAULT 0,
			low_stock_threshold INTEGER DEFAULT 5,
			last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES Products (id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS StockMovements (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL,
			change_type TEXT NOT NULL,
			quantity_change INTEGER NOT NULL,
			note TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES Products (id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS LowStockAlerts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL,
			alert_message TEXT NOT NULL,
			resolved BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES Products (id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS Categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS CreditTransactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			phone_number TEXT,
			quantity INTEGER NOT NULL,
			credit_amount REAL NOT NULL,
			status TEXT NOT NULL DEFAULT 'unpaid',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES Products (id) ON DELETE CASCADE
		);
	`
	_, err := d.DB.Exec(query)
	return err
}
