package mail

import (
	"bytes"
	"context"
	"embed"
	"errors"
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
	// RegistrationTokenTTL is the amount of time a registration token is valid for.
	RegistrationTokenTTL = 30 * time.Minute

	// SendEmailTimeout is the amount of time we give to our email sending process.
	SendEmailTimeout = 10 * time.Second
)

// templateFS embeds email templates from the templates directory.
//
//go:embed "templates"
var templateFS embed.FS

// Mailer defines the interface for sending transactional emails.
type Mailer interface {
	SendRegistrationEmail(ctx context.Context, user *data.User) error
	SendAccountActivatedEmail(ctx context.Context, user *data.User) error
	Ping(ctx context.Context) error
}

// SESMailer implements the Mailer interface using AWS SES.
type SESMailer struct {
	client *ses.Client
	db     *data.Database
}

// NewSESMailer creates a new SESMailer instance with the provided AWS configuration and database.
func NewSESMailer(awsCfg aws.Config, db *data.Database) *SESMailer {
	client := ses.NewFromConfig(awsCfg)
	return &SESMailer{client: client, db: db}
}

// Ping verifies the SES client can connect to AWS by listing email identities.
func (m *SESMailer) Ping(parent context.Context) error {
	ctx, cancel := context.WithTimeout(parent, SendEmailTimeout)
	defer cancel()
	_, err := m.client.ListEmailIdentities(ctx, nil)
	if err != nil {
		return err
	}
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
	ctx, cancel := context.WithTimeout(parentCtx, SendEmailTimeout)
	defer cancel()
	subject := "Please verify your baduk.online account"
	fromEmail := "no-reply@baduk.online"
	bodyTmpl, err := template.New("registration.tmpl").ParseFS(templateFS, "templates/registration.tmpl")
	if err != nil {
		return err
	}

	err = m.db.Registration.RevokeTokensForUser(ctx, int64(user.ID))
	if err != nil {
		return errors.Join(errors.New("failed to delete existing registration tokens for user"), err)
	}
	token, err := m.db.Registration.NewToken(ctx, int64(user.ID), RegistrationTokenTTL)
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
	err = bodyTmpl.ExecuteTemplate(htmlBody, "registration.tmpl", registrationData)
	if err != nil {
		return errors.Join(errors.New("failed to render email template"), err)
	}
	body := htmlBody.String()

	res, err := m.client.SendEmail(ctx, &ses.SendEmailInput{
		Destination: &sesTypes.Destination{
			ToAddresses: []string{user.Email},
		},
		Content: &sesTypes.EmailContent{
			Simple: &sesTypes.Message{
				Body: &sesTypes.Body{
					// Html
					Html: &sesTypes.Content{
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
	slog.InfoContext(ctx, "sent registration email", "messageID", res.MessageId, "destination", user.Email)
	return nil
}

// AccountActivatedEmailData holds the template data for account activation confirmation emails.
type AccountActivatedEmailData struct {
	Name  string
	Email string
}

// SendAccountActivatedEmail sends a confirmation email after successful account activation.
func (m *SESMailer) SendAccountActivatedEmail(parentCtx context.Context, user *data.User) error {
	ctx, cancel := context.WithTimeout(parentCtx, SendEmailTimeout)
	defer cancel()

	subject := "Your baduk.online account has been activated!"
	fromEmail := "no-reply@baduk.online"

	bodyTmpl, err := template.New("account_activated.tmpl").ParseFS(templateFS, "templates/account_activated.tmpl")
	if err != nil {
		return err
	}

	emailData := &AccountActivatedEmailData{
		Name:  user.Name,
		Email: user.Email,
	}

	htmlBody := new(bytes.Buffer)
	err = bodyTmpl.ExecuteTemplate(htmlBody, "htmlBody", emailData)
	if err != nil {
		return errors.Join(errors.New("failed to render email template"), err)
	}
	body := htmlBody.String()

	res, err := m.client.SendEmail(ctx, &ses.SendEmailInput{
		Destination: &sesTypes.Destination{
			ToAddresses: []string{user.Email},
		},
		Content: &sesTypes.EmailContent{
			Simple: &sesTypes.Message{
				Body: &sesTypes.Body{
					Html: &sesTypes.Content{
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
	slog.InfoContext(ctx, "sent account activated email", "messageID", res.MessageId, "destination", user.Email)
	return nil
}
