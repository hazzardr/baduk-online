//go:build !embedfrontend

package main

import "io/fs"

// frontendFS returns nil: this binary was built without -tags embedfrontend, so
// it serves only the API. Use `pnpm dev` for the UI locally, or `make build` to
// embed it.
func frontendFS() fs.FS {
	return nil
}
