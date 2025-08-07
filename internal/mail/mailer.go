package mail

import (
	"bytes"
	"context"
	"embed"
	"html/template"
	"log/slog"
	"time"

	"github.com/hazzardr/go-baduk/internal/data"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

//go:embed "templates"
var templateFS embed.FS

type Mailer interface {
	SendRegistrationEmail(ctx context.Context, user *data.User) error
}

type SESMailer struct {
	client *ses.Client
}

func NewSESMailer(awsCfg aws.Config) *SESMailer {
	ses := ses.NewFromConfig(awsCfg)
	return &SESMailer{client: ses}
}

func (m *SESMailer) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := m.client.ListIdentities(ctx, &ses.ListIdentitiesInput{
		IdentityType: types.IdentityTypeEmailAddress,
	})
	if err != nil {
		return err
	}
	slog.Info("ses ping OK")
	return err
}

type RegistrationEmailData struct {
	Name     string
	Email    string
	LoginURL string
}

func (m *SESMailer) SendRegistrationEmail(ctx context.Context, user *data.User) error {
	tmpl, err := template.ParseFS(templateFS, "templates/registration.tmpl")
	if err != nil {
		return err
	}

	data := RegistrationEmailData{
		Name:     user.Name,
		Email:    user.Email,
		LoginURL: "https://go-baduk.com/login",
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return err
	}

	input := &ses.SendEmailInput{
		Source: aws.String("notifications@bricoud.xyz"),
		Destination: &types.Destination{
			ToAddresses: []string{"rbrianhazzard@protonmail.com"},
		},
		Message: &types.Message{
			Subject: &types.Content{
				Data:    aws.String("Welcome to Go-Baduk!"),
				Charset: aws.String("UTF-8"),
			},
			Body: &types.Body{
				Html: &types.Content{
					Data:    aws.String(body.String()),
					Charset: aws.String("UTF-8"),
				},
			},
		},
	}

	_, err = m.client.SendEmail(ctx, input)
	return err
}
