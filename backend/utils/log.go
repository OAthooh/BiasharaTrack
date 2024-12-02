package utils

import (
	"fmt"
	"log"
	"os"
	"time"
)

var (
	infoLogger    *log.Logger
	warningLogger *log.Logger
	errorLogger   *log.Logger
)

func init() {
	// Create logs directory if it doesn't exist
	if err := os.MkdirAll("./logs", 0o755); err != nil {
		log.Fatal("Failed to create logs directory:", err)
	}

	// Open log file with current date
	currentTime := time.Now()
	logFileName := fmt.Sprintf("logs/app_%s.log", currentTime.Format("2006-01-02"))

	file, err := os.OpenFile(logFileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o666)
	if err != nil {
		log.Fatal("Failed to open log file:", err)
	}

	// Initialize different loggers with prefixes
	infoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	warningLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

// Info logs information messages
func InfoLogger(format string, v ...interface{}) {
	infoLogger.Printf(format, v...)
}

// Warning logs warning messages
func WarningLogger(format string, v ...interface{}) {
	warningLogger.Printf(format, v...)
}

// Error logs error messages
func ErrorLogger(format string, v ...interface{}) {
	errorLogger.Printf(format, v...)
}

// Fatal logs error message and exits the application
func FatalLogger(format string, v ...interface{}) {
	errorLogger.Printf(format, v...)
	os.Exit(1)
}
