package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
)

func TestWriteJSON(t *testing.T) {
	tests := []struct {
		name       string
		data       any
		status     int
		wantStatus int
		wantKey    string
		wantValue  any
	}{
		{
			name:       "Success with simple data",
			data:       map[string]string{"message": "test"},
			status:     http.StatusOK,
			wantStatus: http.StatusOK,
			wantKey:    "message",
			wantValue:  "test",
		},
		{
			name:       "Success with created status",
			data:       map[string]int{"count": 42},
			status:     http.StatusCreated,
			wantStatus: http.StatusCreated,
			wantKey:    "count",
			wantValue:  float64(42),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rr := httptest.NewRecorder()

			err := writeJSON(rr, tt.status, tt.data)
			if err != nil {
				t.Fatalf("writeJSON returned error: %v", err)
			}

			resp := rr.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("status code = %d, want %d", resp.StatusCode, tt.wantStatus)
			}

			if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, want %q", ct, "application/json")
			}

			var body map[string]any
			if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
				t.Fatalf("couldn't decode response body: %v", err)
			}
			if body[tt.wantKey] != tt.wantValue {
				t.Errorf("body[%q] = %v, want %v", tt.wantKey, body[tt.wantKey], tt.wantValue)
			}
		})
	}
}

func TestReadJSON(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	tests := []struct {
		name        string
		requestBody string
		wantStruct  testStruct
		wantError   bool
		errorString string
	}{
		{
			name:        "Valid JSON",
			requestBody: `{"name":"John","age":30}`,
			wantStruct:  testStruct{Name: "John", Age: 30},
			wantError:   false,
		},
		{
			name:        "Empty body",
			requestBody: "",
			wantError:   true,
			errorString: "body must not be empty",
		},
		{
			name:        "Invalid JSON syntax",
			requestBody: `{"name":"John","age":30,}`,
			wantError:   true,
			errorString: "body contains badly-formed JSON",
		},
		{
			name:        "Unknown field",
			requestBody: `{"name":"John","age":30,"unknown":true}`,
			wantError:   true,
			errorString: "body contains unknown key",
		},
		{
			name:        "Type mismatch",
			requestBody: `{"name":"John","age":"thirty"}`,
			wantError:   true,
			errorString: "body contains incorrect JSON type",
		},
		{
			name:        "Multiple JSON values",
			requestBody: `{"name":"John","age":30} {"name":"Jane","age":25}`,
			wantError:   true,
			errorString: "body must only contain a single JSON value",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var result testStruct

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))

			err := readJSON(req, &result)

			if tt.wantError {
				if err == nil {
					t.Fatal("expected error but got none")
				}
				if !strings.Contains(err.Error(), tt.errorString) {
					t.Errorf("error = %q, want to contain %q", err.Error(), tt.errorString)
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if result != tt.wantStruct {
					t.Errorf("result = %+v, want %+v", result, tt.wantStruct)
				}
			}
		})
	}
}

func TestErrorResponses(t *testing.T) {
	newEchoContext := func(w http.ResponseWriter, r *http.Request) *echo.Context {
		e := echo.New()
		c := e.NewContext(r, w)
		return c
	}

	tests := []struct {
		name       string
		testFunc   func(*API, *echo.Context) error
		wantStatus int
		wantError  any
	}{
		{
			name: "Bad request response",
			testFunc: func(api *API, c *echo.Context) error {
				return api.badRequestResponse(c, errors.New("bad request"))
			},
			wantStatus: http.StatusBadRequest,
			wantError:  "bad request",
		},
		{
			name: "Failed validation",
			testFunc: func(api *API, c *echo.Context) error {
				return api.failedValidationResponse(c, map[string]string{"field": "invalid"})
			},
			wantStatus: http.StatusUnprocessableEntity,
		},
		{
			name: "Server error response",
			testFunc: func(api *API, c *echo.Context) error {
				return api.serverErrorResponse(c, errors.New("database connection failed"))
			},
			wantStatus: http.StatusInternalServerError,
			wantError:  "the server encountered a problem and could not process your request",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			api := &API{}
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rr := httptest.NewRecorder()
			c := newEchoContext(rr, req)

			tt.testFunc(api, c)

			resp := rr.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("status code = %d, want %d", resp.StatusCode, tt.wantStatus)
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("couldn't read response body: %v", err)
			}

			var parsed map[string]any
			if err := json.Unmarshal(body, &parsed); err != nil {
				t.Fatalf("couldn't parse response body as JSON: %v", err)
			}

			if _, ok := parsed["error"]; !ok {
				t.Error("response body missing 'error' key")
			}

			if tt.wantError != nil {
				if parsed["error"] != tt.wantError {
					t.Errorf("error = %v, want %v", parsed["error"], tt.wantError)
				}
			}
		})
	}
}

// Helper function to compare slices.
func reflect(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
