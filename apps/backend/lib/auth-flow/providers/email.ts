import arc from '@architect/functions';
import Providers from 'next-auth/providers';

type EmailVerificationRequest = {
  identifier: string,
  url: string,
  token: string,
  baseUrl: string
};

export default function EmailProvider() {
  return Providers.Email({
    server: 'mail.decipad.com',
    from: 'info@decipad.com',
    sendVerificationRequest,
  });
};

async function sendVerificationRequest(_verificationRequest: EmailVerificationRequest) {
  // const {
  //   identifier: email,
  //   url,
  //   token,
  //   baseUrl,
  // } = verificationRequest;

  // await arc.queues.publish({
  //   name: `sendemail`,
  //   payload: {
  //     template: 'auth-magiclink',
  //     email,
  //     url,
  //     token,
  //     baseUrl,
  //   },
  // });
}
