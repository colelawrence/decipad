import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { parse as parseCookie } from 'simple-cookie';
import NextAuthJWT from 'next-auth/jwt';
import tables from './tables';
import jwtConf from './auth-flow/jwt';

type AuthResult = {
  user: User | null
  token: string | null | undefined
  secret: string | null
  gotFromSecProtocolHeader: boolean
};

type SessionTokenResult = {
  token: string | null | undefined
  gotFromSecProtocolHeader: boolean
};

type Request = APIGatewayProxyEvent & {
  cookies?: string[] | null
};

type ParsedCookies = Record<string, string>;

const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

async function auth(event: Request): Promise<AuthResult> {
  const { token, gotFromSecProtocolHeader } = getSessionToken(event);
  let user: User | null = null;
  let secret: string | null = null;
  if (token) {
    const { decode: decodeJWT } = NextAuthJWT;
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token,
      });

      if (decoded.accessToken) {
        const userWithSecret = await findUserByAccessToken(decoded.accessToken as string);
        if (userWithSecret) {
          const { secret: _secret, ...userWithoutSecret } = userWithSecret;
          secret = _secret;
          user = userWithoutSecret;
        }
      }
    } catch (err) {
      console.error(err.message);
      // do nothing
    }
  }

  return { user, token, secret, gotFromSecProtocolHeader };
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
    token =
      event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];
    if (token) {
      gotFromSecProtocolHeader = true;
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
  return cookies.reduce((cookies: ParsedCookies, cookie: string) => {
    const { name, value } = parseCookie(cookie) as { name: string, value: string };
    cookies[name] = value;
    return cookies;
  }, {} as ParsedCookies);
}

async function findUserByAccessToken(accessToken: string): Promise<UserWithSecret | undefined> {
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

export default auth;
