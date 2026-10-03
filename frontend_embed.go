//go:build embedfrontend

package main

import (
	"embed"
	"io/fs"
)

// frontendDist is the static Astro build. Run `pnpm build` in frontend/ before
// building with -tags embedfrontend (`make build` does both).
//
//go:embed all:frontend/dist
var frontendDist embed.FS

// frontendFS returns the embedded frontend build.
func frontendFS() fs.FS {
	sub, err := fs.Sub(frontendDist, "frontend/dist")
	if err != nil {
		// The path is a constant that the embed directive already validated.
		panic(err)
	}
	return sub
}
