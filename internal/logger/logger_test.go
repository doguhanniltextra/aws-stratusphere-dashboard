package logger

import (
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestSetup(t *testing.T) {
	// Temporarily override UserConfigDir logic by setting a custom setup or just checking where it goes
	// Since we can't easily mock os.UserConfigDir without a wrapper, we will verify the side effects
	// OR we can query the path logic.

	// Better: Setup is integration test. Let's trust it works if no error.
	// But to inspect file, we need to know where it is.
	configDir, err := os.UserConfigDir()
	if err != nil {
		t.Fatalf("Failed to get config dir: %v", err)
	}
	appDir := filepath.Join(configDir, "Stratusphere")
	logDir := filepath.Join(appDir, "logs")
	logFile := filepath.Join(logDir, "app.log")

	// Clean up before test
	os.RemoveAll(logDir)

	if err := Setup(); err != nil {
		t.Fatalf("Setup failed: %v", err)
	}

	// Read file info
	info, err := os.Stat(logFile)
	if err != nil {
		t.Fatalf("Log file was not created: %v", err)
	}
	if info.Size() == 0 {
		// It might be 0 until first log? Setup logs "Logger initialized"
		// buffer flushing might be an issue? slog default handler writes immediately usually?
		// But lumberjack might buffer? No, it's just a file writer.
		// Wait a bit?
	}

	// Write a test log
	msg := "Test log message"
	slog.Info(msg, "test_id", 123)

	// Read file content
	content, err := os.ReadFile(logFile)
	if err != nil {
		t.Fatalf("Failed to read log file: %v", err)
	}

	output := string(content)
	if !strings.Contains(output, msg) {
		t.Errorf("Log file content missing message. Content: %s", output)
	}

	if !strings.Contains(output, "test_id") {
		t.Errorf("Log file content missing structured data. Content: %s", output)
	}

	// Verify JSON
	lines := strings.Split(strings.TrimSpace(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var js map[string]interface{}
		if err := json.Unmarshal([]byte(line), &js); err != nil {
			t.Errorf("Log line is not valid JSON: %s, error: %v", line, err)
		}
	}
}
