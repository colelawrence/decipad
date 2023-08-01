// eslint-disable-next-line import/no-extraneous-dependencies
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { email as emailConfig } from '@decipad/backend-config';
import { debug } from './debug';

const { ses: sesConfig, senderEmailAddress } = emailConfig();

type SendEmailParams = {
  to: string;
  body: string;
  subject: string;
};

const serviceOptions = {
  ...sesConfig,
  apiVersion: '2019-09-27',
};

const service = new SESClient(serviceOptions);

export async function sendEmail({
  to,
  body,
  subject,
}: SendEmailParams): Promise<void> {
  debug('will send email', { to, body, subject });
  const params = {
    Message: {
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8',
        },
      },
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
    },
    Destination: {
      ToAddresses: [to],
    },
    Source: senderEmailAddress,
    ReplyToAddresses: [senderEmailAddress],
  };
  debug('send email params', params);
  const result = await service.send(new SendEmailCommand(params));
  debug('send email result', result);
}
