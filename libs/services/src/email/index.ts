// eslint-disable-next-line import/no-extraneous-dependencies
import { Recipient, EmailParams, MailerSend, Sender } from 'mailersend';
import { email as emailConfig } from '@decipad/backend-config';
import { debug } from './debug';

const { apiKey } = emailConfig();
const sender = new MailerSend({ apiKey });

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
    console.warn('skipping email send because no api key');
    return;
  }
  // eslint-disable-next-line no-console
  console.log('will send email', { to, body, subject });
  const params = new EmailParams()
    .setHtml(body)
    .setSubject(subject)
    .setTo([new Recipient(to)])
    .setFrom(new Sender('info@decipad.com', 'Decipad'));
  // eslint-disable-next-line no-console
  console.log('send email params', params);
  const result = await sender.email.send(params);
  if (result.statusCode >= 300) {
    throw new Error(`Error sending email: ${result.body}`);
  }

  debug('send email result', result);
}
