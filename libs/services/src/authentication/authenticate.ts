/* eslint-disable no-console */
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { parse as parseCookie } from 'simple-cookie';
import NextAuthJWT from 'next-auth/jwt';
import { getDefined } from '@decipad/utils';
import { User, UserWithSecret } from '@decipad/backendtypes';
import tables from '../tables';
import { jwt as jwtConf } from './jwt';

type AuthResult = {
  user: User | undefined;
  token: string | undefined;
  secret: string | undefined;
  gotFromSecProtocolHeader: boolean;
};

interface AuthenticatedAuthResult extends AuthResult {
  user: User;
  token: string;
}

type SessionTokenResult = {
  token: string | undefined;
  gotFromSecProtocolHeader: boolean;
};

type Request = APIGatewayProxyEvent & {
  cookies?: string[] | null;
};

type ParsedCookies = Record<string, string>;

export const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export async function authenticate(event: Request): Promise<AuthResult> {
  const { token, gotFromSecProtocolHeader } = getSessionToken(event);
  let user: User | undefined;
  let secret: string | undefined;
  if (token) {
    const { decode: decodeJWT } = NextAuthJWT;
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token,
      });

      if (decoded.accessToken) {
        const userWithSecret = await findUserByAccessToken(
          decoded.accessToken as string
        );
        if (userWithSecret) {
          const { secret: _secret, ...userWithoutSecret } = userWithSecret;
          secret = _secret;
          user = userWithoutSecret;
        }
      }
    } catch (err) {
      console.error((err as Error).message);
      // do nothing
    }
  }

  return { user, token, secret, gotFromSecProtocolHeader };
}

export async function expectAuthenticated(
  event: Request
): Promise<AuthenticatedAuthResult> {
  const result = await authenticate(event);
  if (!result.user || !result.token) {
    throw Boom.forbidden('Forbidden');
  }
  return {
    ...result,
    user: getDefined(result.user),
    token: getDefined(result.token),
  };
}

function getSessionToken(event: Request): SessionTokenResult {
  let gotFromSecProtocolHeader = false;
  const cookies = parseCookies(event.headers.Cookie || event.cookies || []);
  let token =
    cookies[TOKEN_COOKIE_NAMES[0]] ||
    cookies[TOKEN_COOKIE_NAMES[1]] ||
    event.headers.authorization ||
    event.headers.Authorization;
  if (!token) {
    const protocol =
      event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];
    if (protocol) {
      const protocolParts = protocol
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== 'graphql-transport-ws');
      if (protocolParts.length === 1) {
        [token] = protocolParts;
        gotFromSecProtocolHeader = true;
      }
    }
  }
  if (token && token.startsWith('Bearer ')) {
    token = token.substring('Bearer '.length);
  }
  return { token, gotFromSecProtocolHeader };
}

function parseCookies(cookies: string[] | string): ParsedCookies {
  if (!cookies) {
    cookies = [];
  }
  if (!Array.isArray(cookies)) {
    cookies = [cookies];
  }
  return cookies.reduce((accCookies: ParsedCookies, cookie: string) => {
    const { name, value } = parseCookie(cookie) as {
      name: string;
      value: string;
    };
    accCookies[name] = value;
    return accCookies;
  }, {} as ParsedCookies);
}

async function findUserByAccessToken(
  accessToken: string
): Promise<UserWithSecret | undefined> {
  const data = await tables();

  const foundUsers = await data.users.query({
    IndexName: 'bySecret',
    KeyConditionExpression: 'secret = :secret',
    ExpressionAttributeValues: {
      ':secret': accessToken,
    },
  });

  return foundUsers.Items[0];
}
