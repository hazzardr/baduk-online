package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
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

	for key, val := range headers {
		w.Header()[key] = val
	}

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

func (api *API) failedValidation(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	api.errorResponse(w, r, http.StatusUnprocessableEntity, errors)
}
