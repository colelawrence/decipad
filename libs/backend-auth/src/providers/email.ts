/* eslint-disable no-console */
import arc from '@architect/functions';
import { track } from '@decipad/backend-analytics';
import { app, auth } from '@decipad/backend-config';
import tables from '@decipad/tables';
import { differenceInMinutes } from 'date-fns';
import Email from 'next-auth/providers/email';
import { timestamp } from '@decipad/backend-utils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

type EmailVerificationRequest = {
  identifier: string;
  url: string;
  expires: Date;
  token: string;
};

const getRedirectLink = (originalUrl: string, isFirstLogin: boolean) => {
  const url = new URL(originalUrl);
  const callbackUrl = new URL(
    url.searchParams.get('callbackUrl') ?? app().urlBase
  );
  if (isFirstLogin && callbackUrl.pathname === '/w') {
    callbackUrl.pathname = '/n/welcome';
    url.searchParams.set('callbackUrl', callbackUrl.toString());
  }

  return url.toString();
};

const sendVerificationRequest =
  (event: APIGatewayProxyEventV2) =>
  async (verificationRequest: EmailVerificationRequest) => {
    const {
      identifier: email,
      url: originalUrl,
      token,
      expires: expiresAt,
    } = verificationRequest;

    const data = await tables();
    const key = await data.userkeys.get({ id: `email:${email}` });
    let firstTime = false;
    if (key) {
      const user = await data.users.get({ id: key.user_id });
      firstTime = !user?.first_login;
    }

    const url = getRedirectLink(originalUrl, firstTime);

    if (process.env.ARC_ENV !== 'production') {
      console.log('validation link:');
      console.log(url);
    }

    const expires = `${differenceInMinutes(expiresAt, new Date())} minutes`;

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

    await track(event, {
      event: `send ${firstTime ? 'first ' : ''}verification request`,
      properties: payload,
    });
  };

export default function EmailProvider(event: APIGatewayProxyEventV2) {
  return Email({
    server: 'mail.decipad.com',
    from: 'Decipad <info@decipad.com>',
    sendVerificationRequest: sendVerificationRequest(event),
    maxAge: auth().userKeyValidationExpirationSeconds,
  });
}
