/* eslint-disable no-console */
import { User, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import NextAuthJWT from 'next-auth/jwt';
import { parse as parseCookie } from 'simple-cookie';
import { jwt as jwtConf } from './jwt';

export type AuthResult = {
  user?: User;
  token?: string;
  secret?: string;
  gotFromSecProtocolHeader: boolean;
};

interface AuthenticatedAuthResult extends AuthResult {
  user: User;
  token: string;
}

type SessionTokenResult = {
  token: string;
  gotFromSecProtocolHeader?: boolean;
};

type Request = APIGatewayProxyEvent & {
  cookies?: string[] | null;
};

type ParsedCookies = Record<string, string>;

export const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function validAuthResult(authResult: AuthResult): boolean {
  return !!authResult.secret || !!authResult.user;
}

export async function authenticate(event: Request): Promise<AuthResult[]> {
  const tokens = getSessionTokens(event);
  return (await Promise.all(tokens.map(authenticateOneToken))).filter(
    validAuthResult
  );
}

export async function authenticateOneToken({
  token,
  gotFromSecProtocolHeader = false,
}: {
  token: string;
  gotFromSecProtocolHeader?: boolean;
}): Promise<AuthResult> {
  if (token === 'guest' || (await secretExists(token))) {
    return {
      secret: token,
      user: undefined,
      token,
      gotFromSecProtocolHeader: false,
    };
  }

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

function authenticatedAuthResultFromAuthResult(
  result: AuthResult
): AuthenticatedAuthResult {
  return {
    ...result,
    user: getDefined(result.user),
    token: getDefined(result.token),
  };
}

function validAuthenticatedAuthResult(
  authResult: AuthenticatedAuthResult
): boolean {
  return !!authResult.user || !!authResult.token;
}

export async function expectAuthenticated(
  event: Request
): Promise<AuthenticatedAuthResult[]> {
  const results = (await authenticate(event))
    .map(authenticatedAuthResultFromAuthResult)
    .filter(validAuthenticatedAuthResult);
  if (results.length < 1) {
    throw Boom.forbidden('Forbidden');
  }
  return results;
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

async function secretExists(secret: string): Promise<boolean> {
  const data = await tables();

  const foundSecrets = await data.permissions.query({
    IndexName: 'bySecret',
    KeyConditionExpression: 'secret = :secret',
    ExpressionAttributeValues: {
      ':secret': secret,
    },
  });

  return foundSecrets.Items.length > 0;
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

function getSessionTokens(event: Request): SessionTokenResult[] {
  const tokens: SessionTokenResult[] = [];
  const cookies = parseCookies(event.headers.Cookie || event.cookies || []);
  for (const cookieName of TOKEN_COOKIE_NAMES) {
    if (cookies[cookieName]) {
      tokens.push({ token: cookies[cookieName] });
    }
  }
  for (const headerName of ['authorization', 'Authorizatiion']) {
    let value = event.headers[headerName];
    if (!value) {
      continue;
    }
    if (value.startsWith('Bearer ')) {
      value = value.substring('Bearer '.length);
    }
    tokens.push({ token: value });
  }

  for (const headerName of [
    'sec-websocket-protocol',
    'Sec-WebSocket-Protocol',
  ]) {
    if (event.headers[headerName]) {
      const protocol = event.headers[headerName];
      if (!protocol) {
        continue;
      }
      const protocolParts = protocol
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== 'graphql-transport-ws');

      if (protocolParts.length === 1) {
        tokens.push({
          token: protocolParts[0],
          gotFromSecProtocolHeader: true,
        });
      }
    }
  }

  return tokens;
}
