import { SESV2 } from 'aws-sdk';
import { email as emailConfig } from '../config';

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

export default function sendEmail({
  to,
  body,
  subject,
}: SendEmailParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const params = {
      Content: {
        Simple: {
          Body: {
            Text: {
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
      FromEmailAddress: senderEmailAddress!,
      ReplyToAddresses: [senderEmailAddress!],
    };

    service.sendEmail(params, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
