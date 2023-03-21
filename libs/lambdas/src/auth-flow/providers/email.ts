import arc from '@architect/functions';
import { track } from '@decipad/backend-analytics';
import { auth } from '@decipad/config';
import tables from '@decipad/tables';
import { differenceInHours } from 'date-fns';
import Email from 'next-auth/providers/email';
import { timestamp } from '@decipad/backend-utils';

type EmailVerificationRequest = {
  identifier: string;
  url: string;
  expires: Date;
  token: string;
};

export default function EmailProvider() {
  return Email({
    server: 'mail.decipad.com',
    from: 'Decipad <info@decipad.com>',
    sendVerificationRequest,
    maxAge: auth().userKeyValidationExpirationSeconds,
  });
}

async function sendVerificationRequest(
  verificationRequest: EmailVerificationRequest
) {
  const {
    identifier: email,
    url,
    token,
    expires: expiresAt,
  } = verificationRequest;

  if (process.env.ARC_ENV !== 'production') {
    console.log('validation link:');
    console.log(url);
  }

  const data = await tables();
  const key = await data.userkeys.get({ id: `email:${email}` });
  let firstTime = false;
  if (key) {
    const user = await data.users.get({ id: key.user_id });
    firstTime = !user?.first_login;
  }

  const expires = `${differenceInHours(expiresAt, new Date())} hours`;

  const payload = {
    template: firstTime ? 'auth-magiclink-first' : 'auth-magiclink',
    email,
    url,
    token,
    expires,
  };
  if (!process.env.DECI_E2E) {
    await arc.queues.publish({
      name: `sendemail`,
      payload,
    });
  }

  if (firstTime && key) {
    const user = await data.users.get({ id: key.user_id });
    if (user) {
      user.first_login = timestamp();
      await data.users.put(user);
    }
  }

  await track({
    event: `send ${firstTime ? 'first ' : ''}verification request`,
    properties: payload,
  });
}
