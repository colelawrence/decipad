import arc from '@architect/functions';
import Email from 'next-auth/providers/email';
import { auth } from '@decipad/config';

type EmailVerificationRequest = {
  identifier: string;
  url: string;
  expires: Date;
  token: string;
};

export default function EmailProvider() {
  return Email({
    server: 'mail.decipad.com',
    from: 'info@decipad.com',
    sendVerificationRequest,
    maxAge: auth().userKeyValidationExpirationSeconds,
  });
}

async function sendVerificationRequest(
  verificationRequest: EmailVerificationRequest
) {
  const { identifier: email, url, token } = verificationRequest;

  if (process.env.ARC_ENV !== 'production') {
    console.log('validation link:');
    console.log(url);
  }

  await arc.queues.publish({
    name: `sendemail`,
    payload: {
      template: 'auth-magiclink',
      email,
      url,
      token,
    },
  });
}
