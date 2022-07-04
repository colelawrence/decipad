// eslint-disable-next-line import/no-extraneous-dependencies
import { SESV2 } from 'aws-sdk';
import { email as emailConfig } from '@decipad/config';

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

const service = new SESV2(serviceOptions);

export function sendEmail({
  to,
  body,
  subject,
}: SendEmailParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const params: SESV2.SendEmailRequest = {
      Content: {
        Simple: {
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
      },
      Destination: {
        ToAddresses: [to],
      },
      FromEmailAddress: senderEmailAddress,
      ReplyToAddresses: [senderEmailAddress],
    };

    service.sendEmail(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
