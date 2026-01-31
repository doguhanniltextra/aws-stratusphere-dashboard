package logger

import (
	"log/slog"
	"os"
	"path/filepath"
	"runtime"

	"gopkg.in/natefinch/lumberjack.v2"
)

// Setup configures the global logger to write to a rotating file.
func Setup() error {
	// Determine the log directory
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	appDir := filepath.Join(configDir, "Stratusphere")
	logDir := filepath.Join(appDir, "logs")

	// Create the log directory if it doesn't exist
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return err
	}

	logFile := filepath.Join(logDir, "app.log")

	// Configure lumberjack for log rotation
	rotator := &lumberjack.Logger{
		Filename:   logFile,
		MaxSize:    10,   // megabytes
		MaxBackups: 3,    // number of backups
		MaxAge:     28,   // days
		Compress:   true, // disabled by default
	}

	// Create a new slog handler
	// We use JSONHandler for structured logging
	handler := slog.NewJSONHandler(rotator, &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: true, // Add source file and line context
	})

	// Create and set the global logger
	logger := slog.New(handler)
	slog.SetDefault(logger)

	slog.Info("Logger initialized",
		"log_file", logFile,
		"os", runtime.GOOS,
		"arch", runtime.GOARCH,
	)

	return nil
}
