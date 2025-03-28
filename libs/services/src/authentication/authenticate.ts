/* eslint-disable no-console */
import type {
  AnonUserWithSecret,
  User,
  UserWithSecret,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { decode as decodeJWT } from 'next-auth/jwt';
import { parse as parseCookie } from 'simple-cookie';
import { debug } from './debug';
import { jwt as jwtConf } from './jwt';
import type { AnonUser } from '@decipad/graphqlserver-types';

export interface AuthRequest {
  headers?: {
    [name: string]: string | string[] | undefined;
  };
  cookies?: string[] | null;
}

export type AuthResult = {
  user?: User;
  anonUser?: AnonUser;
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

type ParsedCookies = Record<string, string>;

export const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function isValidAuthResult(authResult: AuthResult): boolean {
  return !!authResult.secret || !!authResult.user || !!authResult.anonUser;
}

export async function authenticate(event: AuthRequest): Promise<AuthResult[]> {
  const tokens = getSessionTokens(event);
  debug('tokens', tokens);
  return (await Promise.all(tokens.map(authenticateOneToken))).filter(
    isValidAuthResult
  );
}

/** Hey */

export async function authenticateOneToken({
  token,
  gotFromSecProtocolHeader = false,
}: {
  token: string;
  gotFromSecProtocolHeader?: boolean;
}): Promise<AuthResult> {
  debug('authenticateOneToken', token);
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
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token,
      });
      debug('decoded token', decoded);

      if (decoded?.accessToken) {
        const userWithSecret = await findUserByAccessToken(
          decoded.accessToken as string
        );
        if (userWithSecret) {
          const { secret: _secret, ...userWithoutSecret } = userWithSecret;
          secret = _secret;
          user = userWithoutSecret;
        }
        const anonUserWithSecret = await findAnonUserByAccessToken(
          decoded.accessToken as string
        );
        if (anonUserWithSecret) {
          const { secret: _secret, ...anonUserWithoutSecret } =
            anonUserWithSecret;
          secret = _secret;
          user = anonUserWithoutSecret;
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

function userAuthenticatedAuthResult(
  authResult: AuthenticatedAuthResult
): boolean {
  return !!authResult.user;
}

export async function getAuthenticatedUser(
  event: AuthRequest
): Promise<User | undefined> {
  return (await authenticate(event))
    .map(authenticatedAuthResultFromAuthResult)
    .filter(userAuthenticatedAuthResult)[0]?.user;
}

export async function expectAuthenticated(
  event: AuthRequest
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

  return foundUsers.Items[0] as UserWithSecret;
}

async function findAnonUserByAccessToken(
  accessToken: string
): Promise<AnonUserWithSecret | undefined> {
  const data = await tables();

  const foundUsers = await data.anonusers.query({
    IndexName: 'bySecret',
    KeyConditionExpression: 'secret = :secret',
    ExpressionAttributeValues: {
      ':secret': accessToken,
    },
  });

  return foundUsers.Items[0] as AnonUserWithSecret;
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

function getSessionTokens(event: AuthRequest): SessionTokenResult[] {
  const tokens: SessionTokenResult[] = [];
  const cookies = parseCookies(
    event.headers?.Cookie || event.headers?.cookie || event.cookies || []
  );
  for (const cookieName of TOKEN_COOKIE_NAMES) {
    if (cookies[cookieName]) {
      tokens.push({ token: cookies[cookieName] });
    }
  }
  for (const headerName of ['authorization', 'Authorization']) {
    let value = event.headers?.[headerName];
    value = Array.isArray(value) ? value[0] : value;
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
    if (event.headers?.[headerName]) {
      let protocol = event.headers?.[headerName];
      protocol = Array.isArray(protocol) ? protocol[0] : protocol;
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
