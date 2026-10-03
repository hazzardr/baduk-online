package main

import "testing"

func TestValidateBaseURL(t *testing.T) {
	tests := []struct {
		name    string
		baseURL string
		wantErr bool
	}{
		{name: "HTTPS", baseURL: "https://play.baduk.online", wantErr: false},
		{name: "HTTP localhost", baseURL: "http://localhost:5173", wantErr: false},
		{name: "Missing scheme", baseURL: "play.baduk.online", wantErr: true},
		{name: "Unsupported scheme", baseURL: "ftp://play.baduk.online", wantErr: true},
		{name: "Missing host", baseURL: "https://", wantErr: true},
		{name: "Empty", baseURL: "", wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateBaseURL(tt.baseURL)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateBaseURL(%q) error = %v, wantErr %v", tt.baseURL, err, tt.wantErr)
			}
		})
	}
}

func TestEnvInt(t *testing.T) {
	t.Setenv("BADUK_TEST_INT", "8080")
	if got := envInt("BADUK_TEST_INT", 4000); got != 8080 {
		t.Errorf("got %d, want 8080", got)
	}

	t.Setenv("BADUK_TEST_INT", "not-a-number")
	if got := envInt("BADUK_TEST_INT", 4000); got != 4000 {
		t.Errorf("got %d, want default 4000", got)
	}

	if got := envInt("BADUK_TEST_INT_UNSET", 4000); got != 4000 {
		t.Errorf("got %d, want default 4000", got)
	}
}

func TestEnvString(t *testing.T) {
	t.Setenv("BADUK_TEST_STR", "production")
	if got := envString("BADUK_TEST_STR", "development"); got != "production" {
		t.Errorf("got %q, want production", got)
	}

	t.Setenv("BADUK_TEST_STR", "")
	if got := envString("BADUK_TEST_STR", "development"); got != "development" {
		t.Errorf("got %q, want default development", got)
	}
}
