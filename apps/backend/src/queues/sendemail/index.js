const { SESV2 } = require('aws-sdk');
const arc = require('@architect/functions');
const templates = require('@architect/shared/email-templates');

const serviceOptions = {
  apiVersion: '2019-09-27',
  accessKeyId: process.env.DECI_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.DECI_SES_SECRET_ACCESS_KEY,
  region: 'eu-west-2',
};

const service = new SESV2(serviceOptions);

exports.handler = arc.queues.subscribe(handler);

async function handler({ template: templateName, ...params }) {
  console.log('SEND EMAIL:', { template: templateName, ...params });
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Could not find template with name ${templateName}`);
  }

  const { subject, body } = template(params);

  await sendEmail({
    to: params.email || params.to.email,
    body,
    subject,
  });

  return;
}

function sendEmail({ to, body, subject }) {
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
      FromEmailAddress: process.env.DECI_FROM_EMAIL_ADDRESS,
      ReplyToAddresses: [process.env.DECI_FROM_EMAIL_ADDRESS],
    };

    service.sendEmail(params, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
