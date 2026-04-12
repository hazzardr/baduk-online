package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"github.com/hazzardr/baduk-online/internal/data"
	"github.com/labstack/echo/v5"
)

// background will launch the given function on a background goRoutine with recovery handlers.
func (api *API) background(fn func()) {
	api.wg.Go(func() {
		defer func() {
			if pv := recover(); pv != nil {
				slog.Error("error executing function", "panic", fmt.Sprintf("%v", pv))
			}
		}()
		fn()
	})
}

func (api *API) getUserFromContext(r *http.Request) (*data.User, error) {
	exists := api.sessionManager.Exists(r.Context(), string(userContextKey))
	if !exists {
		return nil, errUserUnauthenticated
	}
	email := api.sessionManager.GetString(r.Context(), string(userContextKey))
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	return user, err
}

// writeJSON is kept for internal use by sessions.go helpers that still operate on w/r directly.
// Prefer c.JSON() in echo handlers.
func writeJSON(w http.ResponseWriter, status int, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}

// readJSON decodes the request body into dst, enforcing a single JSON value.
func readJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(dst)
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError
		var invalidUnmarshalError *json.InvalidUnmarshalError
		switch {
		case errors.As(err, &syntaxError):
			return fmt.Errorf("body contains badly-formed JSON (at character %d)", syntaxError.Offset)
		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New("body contains badly-formed JSON")
		case errors.As(err, &unmarshalTypeError):
			if unmarshalTypeError.Field != "" {
				return fmt.Errorf("body contains incorrect JSON type for field %q", unmarshalTypeError.Field)
			}
			return fmt.Errorf("body contains incorrect JSON type (at character %d)", unmarshalTypeError.Offset)
		case errors.Is(err, io.EOF):
			return errors.New("body must not be empty")
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return fmt.Errorf("body contains unknown key %s", fieldName)
		case errors.As(err, &invalidUnmarshalError):
			panic(err)
		default:
			return err
		}
	}

	// Ensure there is only one JSON value in the body.
	if err = dec.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("body must only contain a single JSON value")
	}
	return nil
}

func (api *API) errorResponse(c *echo.Context, status int, message any) error {
	return c.JSON(status, map[string]any{"error": message})
}

func (api *API) serverErrorResponse(c *echo.Context, err error) error {
	slog.Error("internal server error", slog.Any("error", err))
	return api.errorResponse(c, http.StatusInternalServerError, "the server encountered a problem and could not process your request")
}

func (api *API) badRequestResponse(c *echo.Context, err error) error {
	return api.errorResponse(c, http.StatusBadRequest, err.Error())
}

func (api *API) failedValidationResponse(c *echo.Context, errors map[string]string) error {
	return api.errorResponse(c, http.StatusUnprocessableEntity, errors)
}

func (api *API) unauthenticatedResponse(c *echo.Context) error {
	return api.errorResponse(c, http.StatusUnauthorized, "you must be authenticated to access this resource")
}

func (api *API) dataConflictResponse(c *echo.Context, err error) error {
	slog.Warn("data conflict", slog.Any("error", err))
	return api.errorResponse(c, http.StatusConflict, "unable to update the record due to an edit conflict, please try again")
}

func (api *API) csrfFailureResponse(w http.ResponseWriter) {
	_ = writeJSON(w, http.StatusForbidden, map[string]any{"error": "CSRF check failed"})
}
