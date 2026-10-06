# OGS OAuth spike

A throwaway program that checks whether baduk.online can act for an OGS user
through OAuth, without the user's password. It has its own `go.mod`, so the
root module's lint and tests ignore it.

## What it checks

1. Authorization-code flow with PKCE (`/oauth2/authorize/`, `/oauth2/token/`)
2. User identity from `/api/v1/me/`, and whether email is exposed
3. Token refresh
4. Realtime JWT from `/api/v1/ui/config` using the OAuth bearer token
5. Authentication on the realtime WebSocket
6. Optional: connect to a game and play a move

## Setup

1. Sign in to OGS and register an application at
   <https://online-go.com/oauth2/applications/>:
   - Client type: **Confidential**
   - Authorization grant type: **Authorization code**
   - Redirect URIs: `http://127.0.0.1:8765/callback`
2. Export the credentials:

   ```bash
   export OGS_CLIENT_ID=...
   export OGS_CLIENT_SECRET=...
   ```

## Run

```bash
cd spikes/ogs-oauth
go run .                       # steps 1–5
go run . -game 12345           # also connect to a game
go run . -game 12345 -move dd  # also play a move (it must be your turn)
VERBOSE=1 go run . ...         # print realtime events as they arrive
```

To test step 6, create a private, unranked game between two of your OGS
accounts, then run the spike as the player whose turn it is.

Flags: `-scopes` (default `read write`), `-ws` (default `wss://online-go.com/`),
`-addr` (default `127.0.0.1:8765`).
