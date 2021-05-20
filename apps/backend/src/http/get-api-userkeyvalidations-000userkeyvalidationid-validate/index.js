const assert = require('assert');
const tables = require('@architect/shared/tables');
const handle = require('@architect/shared/handle');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}
const jwtConf = require('@architect/shared/auth-flow/jwt')({ NextAuthJWT });

const isSecureCookie =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https:');
const tokenCookieName = isSecureCookie
  ? '__Host-next-auth.session-token'
  : 'next-auth.session-token';

exports.handler = handle(async (event) => {
  const data = await tables();

  const validation = await data.userkeyvalidations.get({
    id: event.pathParameters.userkeyvalidationid,
  });

  if (!validation) {
    return {
      statusCode: 404,
      body: 'Validation not found',
    };
  }

  const key = await data.userkeys.get({ id: validation.userkey_id });
  if (!key) {
    return {
      statusCode: 404,
      body: 'User key not found',
    };
  }

  key.validated_at = Date.now();
  await data.userkeys.put(key);

  await data.userkeyvalidations.delete({ id: validation.id });

  const user = await data.users.get({ id: key.user_id });
  if (!user) {
    return {
      statusCode: 404,
      body: 'User not found',
    };
  }

  assert(user.secret, 'use has a secret');
  const token = await NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: user.secret },
  });
  let cookie = `${tokenCookieName}=${token}`;
  cookie += `; HttpOnly; Path=/; Max-Age=${jwtConf.maxAge}; SameSite=Strict`;
  if (isSecureCookie) {
    cookie += '; Secure';
  }

  if (event.queryStringParameters?.redirect === 'false') {
    return {
      statusCode: 201,
      headers: {
        'Set-Cookie': cookie,
      },
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: '/',
      'Set-Cookie': cookie,
    },
  };
});
