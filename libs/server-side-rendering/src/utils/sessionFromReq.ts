/* eslint-disable import/no-extraneous-dependencies */
import { fetch } from '@decipad/fetch';
import type { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import type { Session } from 'next-auth';
import { app } from '@decipad/backend-config';
import { authCookieHeader } from './authCookieHeader';

export const sessionFromReq = async (
  req: APIGatewayProxyEvent
): Promise<Session> => {
  const base = app().urlBase;
  const sessionUrl = new URL('/api/auth/session', base);
  const res = await fetch(sessionUrl, {
    headers: authCookieHeader(req.cookies ?? []),
  });
  if (!res.ok) {
    throw new Error(`session request failed with ${await res.text()}`);
  }
  return res.json();
};
