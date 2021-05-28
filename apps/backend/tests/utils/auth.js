'use strict';

const arc = require('@architect/functions');
const assert = require('assert');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}

async function auth(userId = 'test user id 1') {
  const { encode: encodeJWT } = NextAuthJWT;

  const data = await arc.tables();
  const user = await data.users.get({ id: userId });

  assert(user, `no user with id ${userId} found`);
  assert(user.secret, `no user secret for user with id ${userId} found`);

  const token = {
    accessToken: user.secret,
  };

  const encodedToken = await encodeJWT({
    token,
    secret: process.env.JWT_SECRET,
    signingKey: Buffer.from(
      process.env.JWT_SIGNING_PRIVATE_KEY,
      'base64'
    ).toString(),
  });

  return { token: encodedToken };
}

export default auth;
