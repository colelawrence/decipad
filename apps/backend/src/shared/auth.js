const { parse: parseCookie } = require('simple-cookie');
const tables = require('./tables');
const jwtConf = require('./auth-flow/jwt');

const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

async function auth(event, { NextAuthJWT }) {
  if (typeof NextAuthJWT.encode !== 'function') {
    NextAuthJWT = NextAuthJWT.default;
  }

  const token = getSessionToken(event);
  let user = null;
  let secret = null;
  if (token) {
    const { decode: decodeJWT } = NextAuthJWT;
    try {
      const decoded = await decodeJWT({
        ...jwtConf({ NextAuthJWT }),
        token,
      });

      if (decoded.accessToken) {
        user = await findUserByAccessToken(decoded.accessToken);
        if (user) {
          secret = user.secret;
          delete user.secret;
        }
      }
    } catch (err) {
      console.error(err.message);
      // do nothing
    }
  }

  return { user, token, secret };
}

function getSessionToken(event) {
  const cookies = parseCookies(event.cookies);
  let token =
    cookies[TOKEN_COOKIE_NAMES[0]] ||
    cookies[TOKEN_COOKIE_NAMES[1]] ||
    event.headers.authorization ||
    event.headers.Authorization ||
    event.headers['sec-websocket-protocol'] ||
    event.headers['Sec-WebSocket-Protocol'];
  if (token && token.startsWith('Bearer ')) {
    token = token.substring('Bearer '.length);
  }
  return token;
}

function parseCookies(cookies = []) {
  return cookies.reduce((cookies, cookie) => {
    const { name, value } = parseCookie(cookie);
    cookies[name] = value;
    return cookies;
  }, {});
}

async function findUserByAccessToken(accessToken) {
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

module.exports = auth;
