package validator

import (
	"testing"
)

func TestNew(t *testing.T) {
	v := New()
	if v == nil {
		t.Fatal("Expected New() to return a non-nil validator")
	}
	if v.Errors == nil {
		t.Fatal("Expected New() to initialize Errors map")
	}
	if len(v.Errors) != 0 {
		t.Errorf("Expected empty Errors map, got %v", v.Errors)
	}
}

func TestValid(t *testing.T) {
	v := New()
	if !v.Valid() {
		t.Error("Expected new validator to be valid")
	}

	v.Errors["test"] = "error"
	if v.Valid() {
		t.Error("Expected validator with errors to be invalid")
	}
}

func TestAddError(t *testing.T) {
	v := New()
	v.AddError("field", "message")

	if len(v.Errors) != 1 {
		t.Errorf("Expected 1 error, got %d", len(v.Errors))
	}

	if v.Errors["field"] != "message" {
		t.Errorf("Expected error message 'message', got '%s'", v.Errors["field"])
	}

	// Test that AddError doesn't overwrite existing errors
	v.AddError("field", "new message")
	if v.Errors["field"] != "message" {
		t.Errorf("AddError should not overwrite existing error messages")
	}
}

func TestCheck(t *testing.T) {
	v := New()

	// Should not add error when condition is true
	v.Check(true, "field", "message")
	if len(v.Errors) != 0 {
		t.Errorf("Check() should not add error when condition is true")
	}

	// Should add error when condition is false
	v.Check(false, "field", "message")
	if len(v.Errors) != 1 {
		t.Errorf("Check() should add error when condition is false")
	}
	if v.Errors["field"] != "message" {
		t.Errorf("Expected error message 'message', got '%s'", v.Errors["field"])
	}
}

func TestPermittedValue(t *testing.T) {
	tests := []struct {
		name      string
		value     string
		permitted []string
		want      bool
	}{
		{"Value exists", "a", []string{"a", "b", "c"}, true},
		{"Value doesn't exist", "d", []string{"a", "b", "c"}, false},
		{"Empty permitted values", "a", []string{}, false},
		{"Empty value", "", []string{"a", "b", "c"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := PermittedValue(tt.value, tt.permitted...)
			if got != tt.want {
				t.Errorf("PermittedValue() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMatches(t *testing.T) {
	tests := []struct {
		name  string
		value string
		want  bool
	}{
		{"Valid email", "test@example.com", true},
		{"Invalid email - no @", "testexample.com", false},
		{"Invalid email - no domain", "test@", false},
		{"Empty string", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Matches(tt.value, EmailRX)
			if got != tt.want {
				t.Errorf("Matches() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUnique(t *testing.T) {
	tests := []struct {
		name   string
		values []string
		want   bool
	}{
		{"All unique", []string{"a", "b", "c"}, true},
		{"Contains duplicates", []string{"a", "b", "a"}, false},
		{"Empty slice", []string{}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Unique(tt.values)
			if got != tt.want {
				t.Errorf("Unique() = %v, want %v", got, tt.want)
			}
		})
	}
}
