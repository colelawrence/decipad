// eslint-disable-next-line import/no-extraneous-dependencies
import sgMail from '@sendgrid/mail';
import { email as emailConfig } from '@decipad/backend-config';
import { debug } from './debug';

const { apiKey, senderEmailAddress } = emailConfig();
sgMail.setApiKey(apiKey);

type SendEmailParams = {
  to: string;
  body: string;
  subject: string;
};

export async function sendEmail({
  to,
  body,
  subject,
}: SendEmailParams): Promise<void> {
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log('skipping email send because no api key');
    return;
  }
  debug('will send email', { to, body, subject });
  const params = {
    html: body,
    subject,
    to,
    from: senderEmailAddress,
  };
  debug('send email params', params);
  const [result] = await sgMail.send(params);
  if (result.statusCode >= 300) {
    throw new Error(`Error sending email: ${result.body}`);
  }

  debug('send email result', result);
}
