// Command ogs-oauth is a throwaway spike that checks whether a third-party app
// can act for an OGS user:
//
//  1. OAuth2 authorization-code flow (with PKCE) against online-go.com
//  2. Read the user's identity from /api/v1/me/ (and whether email is exposed)
//  3. Refresh the access token
//  4. Exchange the OAuth token for a realtime JWT via /api/v1/ui/config
//  5. Authenticate on the realtime WebSocket
//  6. Optionally connect to a game and play a move
//
// See README.md for setup.
package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/coder/websocket"
	"golang.org/x/oauth2"
)

const ogs = "https://online-go.com"

func main() {
	var (
		addr    = flag.String("addr", "127.0.0.1:8765", "local callback listen address")
		scopes  = flag.String("scopes", "read write", "space-separated OAuth scopes to request")
		wsURL   = flag.String("ws", "wss://online-go.com/", "realtime WebSocket URL")
		gameID  = flag.Int("game", 0, "optional: game ID to connect to")
		move    = flag.String("move", "", "optional: move to play in -game, in OGS coords (e.g. \"dd\")")
		timeout = flag.Duration("timeout", 5*time.Minute, "overall timeout")
	)
	flag.Parse()

	clientID := os.Getenv("OGS_CLIENT_ID")
	clientSecret := os.Getenv("OGS_CLIENT_SECRET")
	if clientID == "" {
		fatalf("OGS_CLIENT_ID is required (OGS_CLIENT_SECRET too, unless the app is a public client)")
	}

	switch {
	case clientSecret == "":
		fmt.Println("  ⚠️  OGS_CLIENT_SECRET is empty; authenticating as a public client")
	case strings.HasPrefix(clientSecret, "pbkdf2_") || strings.Contains(clientSecret, "$"):
		fatalf("OGS_CLIENT_SECRET looks like a stored hash (%.14s…), not the secret itself.\n"+
			"OGS hashes secrets on save: create a new secret and copy it before saving the app.", clientSecret)
	default:
		fmt.Printf("     client_id %d chars, client_secret %d chars\n", len(clientID), len(clientSecret))
	}

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()

	cfg := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  ogs + "/oauth2/authorize/",
			TokenURL: ogs + "/oauth2/token/",
		},
		RedirectURL: "http://" + *addr + "/callback",
		Scopes:      strings.Fields(*scopes),
	}

	// 1. Authorization code + PKCE.
	step("1. OAuth2 authorization code flow")
	tok, err := authorize(ctx, cfg, *addr)
	if err != nil {
		fail(err)
	}
	pass("access token received (type %q, expires %s, refresh token: %t, scope: %v)",
		tok.TokenType, tok.Expiry.Format(time.RFC3339), tok.RefreshToken != "", tok.Extra("scope"))

	// 2. Identity.
	step("2. GET /api/v1/me/")
	client := cfg.Client(ctx, tok)
	me, err := getJSON(ctx, client, ogs+"/api/v1/me/")
	if err != nil {
		fail(err)
	}
	pass("id=%v username=%v", me["id"], me["username"])
	fmt.Printf("     fields returned: %s\n", strings.Join(keys(me), ", "))
	if email, ok := me["email"]; ok {
		fmt.Printf("     email IS exposed: %v (email_validated=%v)\n", email, me["email_validated"])
	} else {
		fmt.Println("     email is NOT exposed")
	}

	// 3. Refresh.
	step("3. Refresh token")
	if tok.RefreshToken == "" {
		warn("no refresh token issued; users would have to re-authorize when the token expires")
	} else {
		expired := *tok
		expired.AccessToken = ""
		expired.Expiry = time.Now().Add(-time.Minute)
		refreshed, err := cfg.TokenSource(ctx, &expired).Token()
		if err != nil {
			fail(err)
		}
		tok = refreshed
		client = cfg.Client(ctx, tok)
		pass("new access token, expires %s, refresh token rotated: %t",
			tok.Expiry.Format(time.RFC3339), refreshed.RefreshToken != expired.RefreshToken)
	}

	// 4. Realtime JWT.
	step("4. GET /api/v1/ui/config (realtime JWT)")
	uiCfg, err := getJSON(ctx, client, ogs+"/api/v1/ui/config")
	if err != nil {
		fail(err)
	}
	jwt, _ := uiCfg["user_jwt"].(string)
	if jwt == "" {
		fail(fmt.Errorf("no user_jwt in /ui/config with an OAuth bearer token (fields: %s)",
			strings.Join(keys(uiCfg), ", ")))
	}
	pass("user_jwt received (%d bytes)", len(jwt))

	// 5. Realtime auth.
	step("5. Realtime WebSocket authenticate")
	rt, err := dialRealtime(ctx, *wsURL)
	if err != nil {
		fail(err)
	}
	defer rt.Close()
	authResp, err := rt.Call(ctx, "authenticate", map[string]any{
		"jwt":            jwt,
		"client":         "baduk.online-spike",
		"client_version": "0.0.1",
	})
	if err != nil {
		fail(err)
	}
	pass("authenticated as %s", authResp)

	// 6. Optional game.
	if *gameID == 0 {
		step("6. Game connect / move (skipped: pass -game ID [-move dd] to test)")
		fmt.Println("\nAll required checks passed.")
		return
	}
	step(fmt.Sprintf("6. Connect to game %d", *gameID))
	if err := rt.Send(ctx, "game/connect", map[string]any{"game_id": *gameID, "chat": false}); err != nil {
		fail(err)
	}
	gamedata, err := rt.WaitEvent(ctx, fmt.Sprintf("game/%d/gamedata", *gameID), 15*time.Second)
	if err != nil {
		fail(err)
	}
	pass("received gamedata (%d bytes)", len(gamedata))

	if *move == "" {
		fmt.Println("\nAll checks passed (no -move given).")
		return
	}
	step(fmt.Sprintf("6b. Play %q in game %d", *move, *gameID))
	if err := rt.Send(ctx, "game/move", map[string]any{"game_id": *gameID, "move": *move}); err != nil {
		fail(err)
	}
	moveEvt, err := rt.WaitEvent(ctx, fmt.Sprintf("game/%d/move", *gameID), 15*time.Second)
	if err != nil {
		fail(err)
	}
	pass("server broadcast move: %s", moveEvt)
	fmt.Println("\nAll checks passed.")
}

// authorize runs the authorization-code flow with PKCE using a local callback server.
func authorize(ctx context.Context, cfg *oauth2.Config, addr string) (*oauth2.Token, error) {
	state := randHex(16)
	verifier := oauth2.GenerateVerifier()

	type result struct {
		code string
		err  error
	}
	results := make(chan result, 1)

	// handle validates callback query params from either the local server or
	// a URL pasted into the terminal.
	handle := func(q url.Values) result {
		var res result
		switch {
		case q.Get("error") != "":
			res.err = fmt.Errorf("authorization denied: %s: %s", q.Get("error"), q.Get("error_description"))
		case q.Get("state") != state:
			res.err = errors.New("state mismatch")
		case q.Get("code") == "":
			res.err = errors.New("no code in callback")
		default:
			res.code = q.Get("code")
		}
		return res
	}
	deliver := func(res result) {
		select {
		case results <- res:
		default:
		}
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("     callback received: %s %s\n", r.Method, r.URL.Path)
		res := handle(r.URL.Query())
		if res.err != nil {
			http.Error(w, res.err.Error(), http.StatusBadRequest)
		} else {
			fmt.Fprintln(w, "OGS authorization received. You can close this tab.")
		}
		deliver(res)
	})

	// Fallback for browsers that can't reach the local server: paste the
	// callback URL from the address bar into the terminal.
	go func() {
		sc := bufio.NewScanner(os.Stdin)
		for sc.Scan() {
			u, err := url.Parse(strings.TrimSpace(sc.Text()))
			if err != nil || u.Query().Get("code") == "" {
				fmt.Println("     not a callback URL with a code; paste the full address bar URL")
				continue
			}
			fmt.Println("     callback URL pasted")
			deliver(handle(u.Query()))
			return
		}
	}()

	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, err
	}
	srv := &http.Server{Handler: mux, ReadHeaderTimeout: 10 * time.Second}
	go func() { _ = srv.Serve(ln) }()
	defer srv.Close()

	authURL := cfg.AuthCodeURL(state, oauth2.S256ChallengeOption(verifier))
	fmt.Printf("     open this URL to authorize:\n     %s\n", authURL)
	fmt.Println("     (if the browser can't reach the callback, paste its address bar URL here and press Enter)")
	openBrowser(authURL)

	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("waiting for callback: %w", ctx.Err())
	case res := <-results:
		if res.err != nil {
			return nil, res.err
		}
		fmt.Println("     exchanging code for token...")
		exCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		tok, err := cfg.Exchange(exCtx, res.code, oauth2.VerifierOption(verifier))
		if err != nil {
			return nil, fmt.Errorf("token exchange: %w", err)
		}
		return tok, nil
	}
}

func getJSON(ctx context.Context, c *http.Client, url string) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GET %s: %s: %s", url, resp.Status, truncate(string(body), 300))
	}
	var out map[string]any
	dec := json.NewDecoder(bytes.NewReader(body))
	dec.UseNumber() // keep IDs exact instead of float64
	if err := dec.Decode(&out); err != nil {
		return nil, fmt.Errorf("GET %s: decode: %w", url, err)
	}
	return out, nil
}

// realtime is a minimal client for the OGS realtime protocol: frames are JSON
// arrays. Requests are [command, data, request_id?]; replies are
// [request_id, data, error]; events are [event_name, data].
type realtime struct {
	conn   *websocket.Conn
	nextID int
	frames chan []json.RawMessage
}

func dialRealtime(ctx context.Context, url string) (*realtime, error) {
	conn, _, err := websocket.Dial(ctx, url, nil)
	if err != nil {
		return nil, fmt.Errorf("dial %s: %w", url, err)
	}
	conn.SetReadLimit(16 << 20)
	rt := &realtime{conn: conn, frames: make(chan []json.RawMessage, 256)}
	go rt.readLoop()
	go rt.pingLoop()
	return rt, nil
}

func (rt *realtime) readLoop() {
	defer close(rt.frames)
	for {
		_, data, err := rt.conn.Read(context.Background())
		if err != nil {
			return
		}
		var frame []json.RawMessage
		if err := json.Unmarshal(data, &frame); err != nil || len(frame) == 0 {
			continue
		}
		rt.frames <- frame
	}
}

func (rt *realtime) pingLoop() {
	t := time.NewTicker(10 * time.Second)
	defer t.Stop()
	for range t.C {
		if err := rt.Send(context.Background(), "net/ping", map[string]any{
			"client": time.Now().UnixMilli(), "drift": 0, "latency": 0,
		}); err != nil {
			return
		}
	}
}

func (rt *realtime) Send(ctx context.Context, cmd string, data any) error {
	return rt.write(ctx, []any{cmd, data})
}

func (rt *realtime) Call(ctx context.Context, cmd string, data any) (string, error) {
	rt.nextID++
	id := rt.nextID
	if err := rt.write(ctx, []any{cmd, data, id}); err != nil {
		return "", err
	}
	timeout := time.After(15 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-timeout:
			return "", fmt.Errorf("%s: no reply after 15s", cmd)
		case frame, ok := <-rt.frames:
			if !ok {
				return "", fmt.Errorf("%s: socket closed", cmd)
			}
			var gotID int
			if json.Unmarshal(frame[0], &gotID) != nil || gotID != id {
				logEvent(frame)
				continue
			}
			if len(frame) > 2 && string(frame[2]) != "null" {
				return "", fmt.Errorf("%s: server error: %s", cmd, frame[2])
			}
			if len(frame) < 2 || string(frame[1]) == "null" {
				return "", fmt.Errorf("%s: empty reply (rejected?)", cmd)
			}
			return string(frame[1]), nil
		}
	}
}

func (rt *realtime) WaitEvent(ctx context.Context, name string, d time.Duration) (string, error) {
	timeout := time.After(d)
	for {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-timeout:
			return "", fmt.Errorf("no %q event after %s", name, d)
		case frame, ok := <-rt.frames:
			if !ok {
				return "", fmt.Errorf("socket closed waiting for %q", name)
			}
			var got string
			if json.Unmarshal(frame[0], &got) == nil && got == name && len(frame) > 1 {
				return truncate(string(frame[1]), 400), nil
			}
			logEvent(frame)
		}
	}
}

func (rt *realtime) write(ctx context.Context, v any) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return rt.conn.Write(ctx, websocket.MessageText, b)
}

func (rt *realtime) Close() { _ = rt.conn.Close(websocket.StatusNormalClosure, "") }

func logEvent(frame []json.RawMessage) {
	if os.Getenv("VERBOSE") == "" {
		return
	}
	parts := make([]string, len(frame))
	for i, p := range frame {
		parts[i] = string(p)
	}
	fmt.Printf("     [event] %s\n", truncate(strings.Join(parts, " "), 200))
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return
	}
	_ = cmd.Start()
}

func keys(m map[string]any) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func randHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

func step(s string)             { fmt.Printf("\n%s\n", s) }
func pass(f string, a ...any)   { fmt.Printf("  ✅ "+f+"\n", a...) }
func warn(f string, a ...any)   { fmt.Printf("  ⚠️  "+f+"\n", a...) }
func fail(err error)            { fmt.Printf("  ❌ %v\n", err); os.Exit(1) }
func fatalf(f string, a ...any) { fmt.Fprintf(os.Stderr, f+"\n", a...); os.Exit(2) }
