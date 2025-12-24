package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"maps"
	"net/http"
	"strings"

	"github.com/hazzardr/baduk-online/internal/data"
)

var OneMB int64 = 1_048_576

type errorResponse struct {
	Error any `json:"error"`
}

func (api *API) writeJSON(w http.ResponseWriter, status int, data any, headers http.Header) error {
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	maps.Copy(w.Header(), headers)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	return err
}

func (api *API) readJSON(w http.ResponseWriter, r *http.Request, inputStruct any) error {
	r.Body = http.MaxBytesReader(w, r.Body, OneMB)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(inputStruct)
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError
		var invalidUnmarshalError *json.InvalidUnmarshalError
		var maxBytesError *http.MaxBytesError

		switch {
		case errors.As(err, &syntaxError):
			return fmt.Errorf("body contains badly formatted JSON at character %d", syntaxError.Offset)
			//https://github.com/golang/go/issues/25956
		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New("body contains badly formatted JSON")
		case errors.As(err, &unmarshalTypeError):
			if unmarshalTypeError.Field != "" {
				return fmt.Errorf("body contains incorrect JSON for field %q", unmarshalTypeError.Field)
			}
			return fmt.Errorf("body contains incorrect JSON type at character %d", unmarshalTypeError.Offset)
		case errors.Is(err, io.EOF):
			return errors.New("body must not be empty")
		// https://github.com/golang/go/issues/29035
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return fmt.Errorf("body contains unknown field: %s", fieldName)
		case errors.As(err, &maxBytesError):
			return fmt.Errorf("body must not be larger than %d bytes", maxBytesError.Limit)
		case errors.Is(err, invalidUnmarshalError):
			panic(err)
		default:
			return err
		}
	}
	err = dec.Decode(&struct{}{})
	if !errors.Is(err, io.EOF) {
		return errors.New("body must only contain a single JSON value")
	}
	return nil
}

func (api *API) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	slog.Debug("bad request", "err", err)
	api.errorResponse(w, r, http.StatusBadRequest, err.Error())
}

func (api *API) errorResponse(w http.ResponseWriter, r *http.Request, status int, data any) {
	resp := &errorResponse{
		Error: data,
	}
	err := api.writeJSON(w, status, resp, nil)
	if err != nil {
		slog.Error(err.Error(), "method", r.Method, "uri", r.URL.RequestURI())
		w.WriteHeader(status)
	}
}

func (api *API) unauthenticatedResponse(w http.ResponseWriter, r *http.Request) {
	resp := &errorResponse{
		Error: "user must be authenticated to perform this function",
	}
	err := api.writeJSON(w, http.StatusUnauthorized, resp, nil)
	if err != nil {
		slog.Error(err.Error(), "method", r.Method, "uri", r.URL.RequestURI())
		w.WriteHeader(http.StatusUnauthorized)
	}
}

func (api *API) serverErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	slog.Error("internal server error", "method", r.Method, "uri", r.URL.RequestURI(), "error", err)
	api.errorResponse(w, r, http.StatusInternalServerError, "internal server error")
}

func (api *API) failedValidationResponse(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	api.errorResponse(w, r, http.StatusUnprocessableEntity, errors)
}

func (api *API) dataConflictResponse(w http.ResponseWriter, r *http.Request, err error) {
	slog.Warn("tried to modify stale data", "err", err)
	api.errorResponse(w, r, http.StatusConflict, "tried to modify stale data, please refresh")
}

func (api *API) rateLimitExceededResponse(w http.ResponseWriter, r *http.Request) {
	slog.Warn("rate limit exceeded", "method", r.Method, "uri", r.URL.RequestURI(), "ip", r.RemoteAddr)
	api.errorResponse(w, r, http.StatusTooManyRequests, "rate limit exceeded, please try again later")
}

func (api *API) csrfFailureResponse(w http.ResponseWriter, r *http.Request) {
	slog.Warn("CSRF check failed", "method", r.Method, "uri", r.URL.RequestURI(), "ip", r.RemoteAddr)
	api.errorResponse(w, r, http.StatusForbidden, "CSRF check failed")
}

func (api *API) forbiddenResponse(w http.ResponseWriter, r *http.Request, message string) {
	slog.Warn("forbidden", "method", r.Method, "uri", r.URL.RequestURI(), "message", message)
	api.errorResponse(w, r, http.StatusForbidden, message)
}

// Begin sync helpers

// background will launch the given function on a background goRoutine with recovery handlers.
func (api *API) background(fn func()) {
	withRecoverPanic := func(caller func()) {
		defer func() {
			pv := recover()
			if pv != nil {
				slog.Error("error executing function", "panic", fmt.Sprintf("%v", pv))
			}
		}()
		caller()
	}
	api.wg.Go(func() {
		withRecoverPanic(fn)
	})
}

// Begin session helpers

func (api *API) getUserFromContext(r *http.Request) (*data.User, error) {
	exists := api.sessionManager.Exists(r.Context(), string(userContextKey))
	if !exists {
		return nil, errUserUnauthenticated
	}
	email := api.sessionManager.GetString(r.Context(), string(userContextKey))
	user, err := api.db.Users.GetByEmail(r.Context(), email)
	return user, err
}
