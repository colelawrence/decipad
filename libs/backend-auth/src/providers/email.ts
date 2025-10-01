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
  console.log('Debug - getRedirectLink - originalUrl:', originalUrl);
  const url = new URL(originalUrl);
  const configuredBaseUrl = app().urlBase;

  // Get the callback URL from params, but validate and correct it
  const callbackUrlParam = url.searchParams.get('callbackUrl');
  let callbackUrl: URL;

  if (callbackUrlParam) {
    try {
      callbackUrl = new URL(callbackUrlParam);
      // If the callback URL is localhost with wrong port, correct it to use the configured port
      if (
        callbackUrl.hostname === 'localhost' &&
        callbackUrl.port !== new URL(configuredBaseUrl).port
      ) {
        console.log(
          'Backend Debug - Correcting callback URL port from',
          callbackUrl.port,
          'to',
          new URL(configuredBaseUrl).port
        );
        callbackUrl.port = new URL(configuredBaseUrl).port;
      }
    } catch (e) {
      // If callbackUrl is invalid, fall back to configured base URL
      callbackUrl = new URL(configuredBaseUrl);
    }
  } else {
    callbackUrl = new URL(configuredBaseUrl);
  }

  // Debug logging
  console.log('Backend Debug - originalUrl:', originalUrl);
  console.log('Backend Debug - callbackUrl from params:', callbackUrlParam);
  console.log('Backend Debug - app().urlBase:', configuredBaseUrl);
  console.log('Backend Debug - final callbackUrl:', callbackUrl.toString());

  if (isFirstLogin && callbackUrl.pathname === '/w') {
    callbackUrl.pathname = '/n/welcome';
  }
  url.searchParams.set('callbackUrl', callbackUrl.toString());

  // Also correct the main URL port if it's localhost with wrong port
  if (
    url.hostname === 'localhost' &&
    url.port !== new URL(configuredBaseUrl).port
  ) {
    console.log(
      'Backend Debug - Correcting main URL port from',
      url.port,
      'to',
      new URL(configuredBaseUrl).port
    );
    url.port = new URL(configuredBaseUrl).port;
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
