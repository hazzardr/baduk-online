package mail

import (
	"github.com/hazzardr/go-baduk/internal/data"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ses"
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

func (m *SNSMailer) SendRegistrationEmail(user *data.User) error {
	return nil
}
