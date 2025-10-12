package mail

import (
	"context"
	"embed"
	"log/slog"
	"time"

	"github.com/hazzardr/baduk-online/internal/data"

	"github.com/aws/aws-sdk-go-v2/aws"

	ses "github.com/aws/aws-sdk-go-v2/service/sesv2"
	sesTypes "github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

// templateFS embeds email templates from the templates directory.
//go:embed "templates"
var templateFS embed.FS

// Mailer defines the interface for sending transactional emails.
type Mailer interface {
	SendRegistrationEmail(ctx context.Context, user *data.User) error
}

// SESMailer implements the Mailer interface using AWS SES.
type SESMailer struct {
	client *ses.Client
}

// NewSESMailer creates a new SESMailer instance with the provided AWS configuration.
func NewSESMailer(awsCfg aws.Config) *SESMailer {
	ses := ses.NewFromConfig(awsCfg)
	return &SESMailer{client: ses}
}

// Ping verifies the SES client can connect to AWS by listing email identities.
func (m *SESMailer) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.client.ListEmailIdentities(ctx, nil)
	if err != nil {
		return err
	}
	slog.Info("ses ping OK")
	return err
}

// RegistrationEmailData holds the template data for registration emails.
type RegistrationEmailData struct {
	Name     string
	Email    string
	LoginURL string
}

// SendRegistrationEmail sends an email with a verification code and redirect for account activation.
func (m *SESMailer) SendRegistrationEmail(ctx context.Context, user *data.User) error {
	subject := "my brand new subject"
	message := "hello world"
	fromEmail := "no-reply@baduk.online"
	res, err := m.client.SendEmail(ctx, &ses.SendEmailInput{
		Destination: &sesTypes.Destination{
			ToAddresses: []string{user.Email},
		},
		Content: &sesTypes.EmailContent{
			Simple: &sesTypes.Message{
				Body: &sesTypes.Body{
					// Html
					Text: &sesTypes.Content{
						Data: &message,
					},
				},
				Subject: &sesTypes.Content{
					Data: &subject,
				},
			},
		},
		FromEmailAddress: &fromEmail,
	})
	if err != nil {
		return err
	}
	slog.Debug("sent registration email", "messageID", res.MessageId, "destination", user.Email)
	return nil
}
