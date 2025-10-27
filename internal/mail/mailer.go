package mail

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"html/template"
	"log/slog"
	"time"

	"github.com/hazzardr/baduk-online/internal/data"

	"github.com/aws/aws-sdk-go-v2/aws"

	ses "github.com/aws/aws-sdk-go-v2/service/sesv2"
	sesTypes "github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

const (
	RegistrationTokenTTL time.Duration = 15 * time.Minute
)

// templateFS embeds email templates from the templates directory.
//
//go:embed "templates"
var templateFS embed.FS

// Mailer defines the interface for sending transactional emails.
type Mailer interface {
	SendRegistrationEmail(ctx context.Context, user *data.User) error
}

// SESMailer implements the Mailer interface using AWS SES.
type SESMailer struct {
	client *ses.Client
	db     *data.Database
}

// NewSESMailer creates a new SESMailer instance with the provided AWS configuration.
func NewSESMailer(awsCfg aws.Config) *SESMailer {
	ses := ses.NewFromConfig(awsCfg)
	return &SESMailer{client: ses}
}

// Ping verifies the SES client can connect to AWS by listing email identities.
func (m *SESMailer) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
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
	Token    string
}

// SendRegistrationEmail sends an email with a verification code and redirect for account activation.
func (m *SESMailer) SendRegistrationEmail(parentCtx context.Context, user *data.User) error {
	ctx, cancel := context.WithTimeout(parentCtx, 5*time.Second)
	defer cancel()
	subject := "Please verify your baduk.online account"
	fromEmail := "no-reply@baduk.online"
	bodyTmpl, err := template.New("").ParseFS(templateFS, "templates/registration.tmpl")
	if err != nil {
		return err
	}

	token, err := m.db.Registration.New(ctx, int64(user.ID), RegistrationTokenTTL)
	if err != nil {
		return err
	}

	registrationData := &RegistrationEmailData{
		Name:     user.Name,
		Email:    user.Email,
		Token:    token.Plaintext,
		LoginURL: fmt.Sprintf("https://play.baduk.online/activate?code=%s", token.Plaintext),
	}

	htmlBody := new(bytes.Buffer)
	bodyTmpl.ExecuteTemplate(htmlBody, "htmlBody", registrationData)
	body := htmlBody.String()

	res, err := m.client.SendEmail(ctx, &ses.SendEmailInput{
		Destination: &sesTypes.Destination{
			ToAddresses: []string{user.Email},
		},
		Content: &sesTypes.EmailContent{
			Simple: &sesTypes.Message{
				Body: &sesTypes.Body{
					// Html
					Text: &sesTypes.Content{
						Data: &body,
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
	slog.Info("sent registration email", "messageID", res.MessageId, "destination", user.Email)
	return nil
}
