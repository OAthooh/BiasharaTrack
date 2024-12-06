// types.go
package mpesa

// "github.com/jwambugu/mpesa-golang-sdk"

// Config holds M-Pesa configuration
type Config struct {
	ConsumerKey       string
	ConsumerSecret    string
	BusinessShortCode string
	PassKey           string
	CallbackURL       string
	Environment       string
}

// Transaction represents an M-Pesa transaction record
type Transaction struct {
	ID                string
	MerchantRequestID string
	CheckoutRequestID string
	ResultCode        int
	Amount            float64
	PhoneNumber       string
	Reference         string
	Description       string
	ReceiptNumber     string
	TransactionDate   string
	Status            string
}
