// client.go
package mpesa

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	mpesasdk "github.com/jwambugu/mpesa-golang-sdk"
)

// MpesaClient wraps the SDK client
type MpesaClient struct {
	app    *mpesasdk.Mpesa
	config Config
}

// NewMpesaClient creates a new M-Pesa client instance
func NewMpesaClient(consumerKey, consumerSecret string, isSandbox bool) *MpesaClient {
	env := mpesasdk.EnvironmentProduction
	if isSandbox {
		env = mpesasdk.EnvironmentSandbox
	}
	app := mpesasdk.NewApp(
		http.DefaultClient,
		consumerKey,
		consumerSecret,
		env,
	)
	return &MpesaClient{
		app: app,
		config: Config{
			ConsumerKey:       consumerKey,
			ConsumerSecret:    consumerSecret,
			PassKey:           os.Getenv("MPESA_PASSKEY"),
			CallbackURL:       os.Getenv("CALLBACK_URL"),
			BusinessShortCode: os.Getenv("MPESA_BUSINESS_SHORTCODE"),
		},
	}
}

// STKPushRequest represents the request structure for STK push
type STKPushRequest struct {
	PhoneNumber string
	Amount      uint
	Reference   string
	Description string
}

// validatePhoneNumber validates and converts a phone number to uint64
func ValidatePhoneNumber(phoneNumber string) (uint64, error) {
	// Remove any spaces or hyphens
	phoneNumber = strings.ReplaceAll(phoneNumber, " ", "")
	phoneNumber = strings.ReplaceAll(phoneNumber, "-", "")

	// Check if the phone number starts with country code or local prefix
	if strings.HasPrefix(phoneNumber, "0") {
		// Replace leading 0 with 254 (Kenya country code)
		phoneNumber = "254" + phoneNumber[1:]
	} else if !strings.HasPrefix(phoneNumber, "254") {
		// Prepend country code if not already present
		phoneNumber = "254" + phoneNumber
	}

	// Validate length
	if len(phoneNumber) != 12 {
		return 0, errors.New("invalid phone number format")
	}

	// Convert to uint64
	parsedNumber, err := strconv.ParseUint(phoneNumber, 10, 64)
	if err != nil {
		return 0, errors.New("invalid phone number")
	}

	return parsedNumber, nil
}

// InitiateSTKPush initiates an STK push request
func (m *MpesaClient) InitiateSTKPush(req STKPushRequest) (*mpesasdk.Response, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Convert and validate phone number
	phoneNumber, err := ValidatePhoneNumber(req.PhoneNumber)
	if err != nil {
		return nil, fmt.Errorf("phone number validation failed: %v", err)
	}

	// Convert BusinessShortCode from string to uint
	businessShortCode, err := strconv.ParseUint(m.config.BusinessShortCode, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid business short code: %v", err)
	}

	stkReq := mpesasdk.STKPushRequest{
		BusinessShortCode: uint(businessShortCode),
		TransactionType:   mpesasdk.CustomerPayBillOnlineTransactionType,
		Amount:            req.Amount,
		PartyA:            uint(phoneNumber),
		PartyB:            uint(businessShortCode),
		PhoneNumber:       phoneNumber,
		CallBackURL:       m.config.CallbackURL,
		AccountReference:  req.Reference,
		TransactionDesc:   req.Description,
	}

	return m.app.STKPush(ctx, m.config.PassKey, stkReq)
}

// GetAccessToken generates a new access token
func (m *MpesaClient) GetAccessToken() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return m.app.GenerateAccessToken(ctx)
}