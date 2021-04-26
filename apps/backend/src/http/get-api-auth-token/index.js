'use strict';

const arc = require('@architect/functions');
let jwt = require('next-auth/jwt');
if (typeof jwt.decode !== 'function') {
  jwt = jwt.default;
}
const { decode: decodeJWT } = jwt;
const { parse: parseCookie } = require('simple-cookie');
const jwtConf = require('@architect/shared/auth/jwt')({ NextAuthJWT: jwt });
const handle = require('@architect/shared/handle');

const TOKEN_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

exports.handler = handle(async (event) => {
  const cookies = parseCookies(event.cookies);
  const token =
    cookies[TOKEN_COOKIE_NAMES[0]] || cookies[TOKEN_COOKIE_NAMES[1]];
  let user = null;
  if (token) {
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token,
      });
      if (decoded.accessToken) {
        const tables = await arc.tables();
        user = await tables.users.get({ id: decoded.accessToken });
      }
    } catch (err) {
      console.error(err.message);
      // do nothing
    }
  }

  if (user) {
    return token;
  } else {
    return {
      statusCode: 403,
    };
  }
});

function parseCookies(cookies = []) {
  return cookies.reduce((cookies, cookie) => {
    const { name, value } = parseCookie(cookie);
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}
