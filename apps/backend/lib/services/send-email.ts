import { SESV2 } from 'aws-sdk';

type SendEmailParams = {
  to: string
  body: string
  subject:string
}

const serviceOptions = {
  apiVersion: '2019-09-27',
  accessKeyId: process.env.DECI_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.DECI_SES_SECRET_ACCESS_KEY,
  region: 'eu-west-2',
};

const service = new SESV2(serviceOptions);

const senderEmailAddress = process.env.DECI_FROM_EMAIL_ADDRESS;
if (!senderEmailAddress) {
  throw new Error('Environment variable DECI_FROM_EMAIL_ADDRESS is not defined');
}

export default function sendEmail({ to, body, subject }: SendEmailParams): Promise<void> {
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
};
