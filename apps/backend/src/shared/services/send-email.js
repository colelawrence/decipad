const { SESV2 } = require('aws-sdk');

module.exports = function sendEmail({ to, body, subject }) {
  const serviceOptions = {
    apiVersion: '2019-09-27',
    accessKeyId: process.env.DECI_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.DECI_SES_SECRET_ACCESS_KEY,
    region: 'eu-west-2',
  };

  const service = new SESV2(serviceOptions);
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
};
