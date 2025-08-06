package api

import (
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWriteJSON(t *testing.T) {
	tests := []struct {
		name        string
		data        any
		status      int
		headers     http.Header
		wantStatus  int
		wantBody    string
		wantHeaders http.Header
	}{
		{
			name:       "Success with simple data",
			data:       map[string]string{"message": "test"},
			status:     http.StatusOK,
			headers:    nil,
			wantStatus: http.StatusOK,
			wantBody:   "{\n\t\"message\": \"test\"\n}",
			wantHeaders: http.Header{
				"Content-Type": []string{"application/json"},
			},
		},
		{
			name:   "Success with custom headers",
			data:   map[string]int{"count": 42},
			status: http.StatusCreated,
			headers: http.Header{
				"X-Custom": []string{"value"},
			},
			wantStatus: http.StatusCreated,
			wantBody:   "{\n\t\"count\": 42\n}",
			wantHeaders: http.Header{
				"Content-Type": []string{"application/json"},
				"X-Custom":     []string{"value"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rr := httptest.NewRecorder()
			api := &API{}

			err := api.writeJSON(rr, tt.status, tt.data, tt.headers)
			if err != nil {
				t.Fatalf("writeJSON returned error: %v", err)
			}

			resp := rr.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("status code = %d, want %d", resp.StatusCode, tt.wantStatus)
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("couldn't read response body: %v", err)
			}

			if string(body) != tt.wantBody {
				t.Errorf("body = %q, want %q", string(body), tt.wantBody)
			}

			for k, v := range tt.wantHeaders {
				if !reflect(resp.Header[k], v) {
					t.Errorf("header[%q] = %v, want %v", k, resp.Header[k], v)
				}
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
			errorString: "body contains badly formatted JSON",
		},
		{
			name:        "Unknown field",
			requestBody: `{"name":"John","age":30,"unknown":true}`,
			wantError:   true,
			errorString: "body contains unknown field",
		},
		{
			name:        "Type mismatch",
			requestBody: `{"name":"John","age":"thirty"}`,
			wantError:   true,
			errorString: "body contains incorrect JSON",
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
			api := &API{}
			var result testStruct

			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.requestBody))
			rr := httptest.NewRecorder()

			err := api.readJSON(rr, req, &result)

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
	tests := []struct {
		name       string
		testFunc   func(*API, http.ResponseWriter, *http.Request)
		wantStatus int
		wantBody   string
	}{
		{
			name: "Bad request response",
			testFunc: func(api *API, w http.ResponseWriter, r *http.Request) {
				api.badRequestResponse(w, r, errors.New("bad request"))
			},
			wantStatus: http.StatusBadRequest,
			wantBody:   "{\n\t\"error\": \"bad request\"\n}",
		},
		{
			name: "Failed validation",
			testFunc: func(api *API, w http.ResponseWriter, r *http.Request) {
				api.failedValidationResponse(w, r, map[string]string{"field": "invalid"})
			},
			wantStatus: http.StatusUnprocessableEntity,
			wantBody:   "{\n\t\"error\": {\n\t\t\"field\": \"invalid\"\n\t}\n}",
		},
		{
			name: "Server error response",
			testFunc: func(api *API, w http.ResponseWriter, r *http.Request) {
				api.serverErrorResponse(w, r, errors.New("database connection failed"))
			},
			wantStatus: http.StatusInternalServerError,
			wantBody:   "{\n\t\"error\": \"internal server error\"\n}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			api := &API{}
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rr := httptest.NewRecorder()

			tt.testFunc(api, rr, req)

			resp := rr.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("status code = %d, want %d", resp.StatusCode, tt.wantStatus)
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("couldn't read response body: %v", err)
			}

			if string(body) != tt.wantBody {
				t.Errorf("body = %q, want %q", string(body), tt.wantBody)
			}
		})
	}
}

// Helper function to compare slices
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
