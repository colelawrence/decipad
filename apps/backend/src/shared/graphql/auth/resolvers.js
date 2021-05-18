'use strict';

const assert = require('assert');
const { UserInputError, ForbiddenError } = require('apollo-server-lambda');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}
const { tokenize: tokenizeCookies } = require('simple-cookie');
const tables = require('../../tables');
const jwtConf = require('../../auth-flow/jwt')({ NextAuthJWT });

const inTesting = process.env.ARC_ENV === 'testing';

module.exports = {
  Mutation: {
    async pretendUser(_, { userId }, context) {
      if (!inTesting) {
        throw new ForbiddenError('Forbidden');
      }

      const data = await tables();
      const user = await data.users.get({ id: userId });

      if (!user) {
        throw new UserInputError('No such user');
      }

      const options = {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      };
      assert(user.secret, 'User does not have secret');
      const token = await generateToken(user.secret, options);
      context.additionalHeaders.set(
        'Set-Cookie',
        tokenizeCookies([{ name: 'next-auth.session-token', value: token }])
      );

      return true;
    },
  },
};

async function generateToken(userSecret, options) {
  return await NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: userSecret },
    ...options,
  });
}
