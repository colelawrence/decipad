/* eslint-disable import/no-extraneous-dependencies */
import { fetch } from '@decipad/fetch';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { Session } from 'next-auth';
import { authCookieHeader } from './authCookieHeader';
import { baseUrlFromReq } from './baseUrlFromReq';

export const sessionFromReq = async (
  req: APIGatewayProxyEvent
): Promise<Session> => {
  const base = baseUrlFromReq(req);
  const sessionUrl = new URL('/api/auth/session', base);
  const res = await fetch(sessionUrl, {
    headers: authCookieHeader(req.cookies ?? []),
  });
  if (!res.ok) {
    throw new Error(`session request failed with ${await res.text()}`);
  }
  return res.json();
};
