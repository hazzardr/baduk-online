package mail

import (
	"context"
	"log/slog"
	"time"

	"github.com/hazzardr/baduk-online/internal/data"

	"github.com/aws/aws-sdk-go-v2/aws"

	ses "github.com/aws/aws-sdk-go-v2/service/sesv2"
	sesTypes "github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

type Mailer interface {
	SendRegistrationEmail(user *data.User) error
}

type SNSMailer struct {
	client *ses.Client
}

func NewSNSMailer(awsCfg aws.Config) *SNSMailer {
	ses := ses.NewFromConfig(awsCfg)
	return &SNSMailer{client: ses}
}

// SendRegistrationEmail sends an email with a verification code + redirect for account activation
func (m *SNSMailer) SendRegistrationEmail(user *data.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	subject := "my brand new subject"
	message := "hello world"
	fromEmail := "no-reply.baduk.online"
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
