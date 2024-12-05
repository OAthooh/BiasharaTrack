package database

import "github.com/OAthooh/BiasharaTrack.git/models"

func (d *DB) Migrate() error {
	err := d.DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Inventory{},
		&models.StockMovement{},
		&models.LowStockAlert{},
		&models.Category{},
		&models.CreditTransaction{},
	)
	if err != nil {
		return err
	}
	return nil
}
