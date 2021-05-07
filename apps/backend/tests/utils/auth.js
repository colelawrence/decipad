'use strict';

let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}

const jwtConf = require('../../src/shared/auth-flow/jwt')({ NextAuthJWT });

async function auth(userId = 'test user id 1') {
  const { encode: encodeJWT } = NextAuthJWT;

  const token = {
    accessToken: userId,
  };

  const encodedToken = await encodeJWT({
    token,
    secret: process.env.JWT_SECRET,
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  });

  return { token: encodedToken };
}

export default auth;
