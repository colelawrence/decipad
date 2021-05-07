'use strict';

const auth = require('@architect/shared/auth');
const handle = require('@architect/shared/handle');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}
const jwtConf = require('@architect/shared/auth-flow/jwt')({ NextAuthJWT });

const purposes = {
  pubsub: {
    maxAge: 5 * 60, // 5 minutes
  },
};

exports.handler = handle(async (event) => {
  const { user } = await auth(event, { NextAuthJWT });

  if (user) {
    const purposeName = event.queryStringParameters.for;
    const purpose = purposes[purposeName];
    if (!purpose) {
      return {
        statusCode: 406,
        body: 'No such purpose',
      };
    }
    return await generateToken(user, purpose);
  } else {
    return {
      statusCode: 403,
    };
  }
});

async function generateToken(user, options) {
  return await NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: user.id },
    ...options,
  });
}
