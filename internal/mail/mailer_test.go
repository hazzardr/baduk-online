package mail

import "testing"

func TestActivationURL(t *testing.T) {
	tests := []struct {
		name    string
		baseURL string
		token   string
		want    string
	}{
		{
			name:    "Production URL",
			baseURL: "https://play.baduk.online",
			token:   "ABC123",
			want:    "https://play.baduk.online/activate?code=ABC123",
		},
		{
			name:    "Trailing slash",
			baseURL: "http://localhost:5173/",
			token:   "ABC123",
			want:    "http://localhost:5173/activate?code=ABC123",
		},
		{
			name:    "Base path",
			baseURL: "https://example.com/baduk",
			token:   "ABC123",
			want:    "https://example.com/baduk/activate?code=ABC123",
		},
		{
			name:    "Token is query-escaped",
			baseURL: "https://play.baduk.online",
			token:   "a+b/c=",
			want:    "https://play.baduk.online/activate?code=a%2Bb%2Fc%3D",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ActivationURL(tt.baseURL, tt.token)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("got %q, want %q", got, tt.want)
			}
		})
	}
}
