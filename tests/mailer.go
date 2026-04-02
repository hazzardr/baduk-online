package tests

import (
	"context"

	"github.com/hazzardr/baduk-online/internal/data"
)

type MockMailer struct{}

func NewMockMailer() MockMailer {
	return MockMailer{}
}

func (m *MockMailer) SendAccountActivatedEmail(ctx context.Context, user *data.User) error {
	return nil
}
func (m *MockMailer) Ping(ctx context.Context) error {
	return nil
}
func (m *MockMailer) SendRegistrationEmail(ctx context.Context, user *data.User) error {
	return nil
}
