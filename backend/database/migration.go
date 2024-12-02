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
	`
	_, err := d.DB.Exec(query)
	return err
}
