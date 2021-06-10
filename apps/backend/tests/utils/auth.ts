'use strict';

import arc from '@architect/functions';
import assert from 'assert';
import NextAuthJWT from 'next-auth/jwt';

async function auth(userId = 'test user id 1') {
  const { encode: encodeJWT } = NextAuthJWT;

  const data = await arc.tables();
  const user = await data.users.get({ id: userId }) as UserWithSecret;

  assert(user, `no user with id ${userId} found`);
  assert(user.secret, `no user secret for user with id ${userId} found`);

  const token = {
    accessToken: user.secret,
  };

  const encodedToken: string = await encodeJWT({
    token,
    secret: process.env.JWT_SECRET!,
    signingKey: Buffer.from(
      process.env.JWT_SIGNING_PRIVATE_KEY!,
      'base64'
    ).toString(),
  });

  return {
    token: encodedToken,
    user: user as User,
    secret: user.secret,
    gotFromSecProtocolHeader: false,
    link: undefined
  };
}

export default auth;
