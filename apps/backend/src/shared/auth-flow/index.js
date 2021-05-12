'use strict';

const tables = require('../tables');
const { GitHub, Email } = require('./providers');
const { nanoid } = require('nanoid');
const adaptReqRes = require('./adapt-req-res');
const createDbAdapter = require('./db-adapter');
const jwt = require('./jwt');

const inTesting = !!process.env.JEST_WORKER_ID;

if (inTesting) {
  process.env.NEXT_AUTH_URL = 'http://localhost:3333/api/auth';
}

module.exports = function createAuthHandler({ NextAuth, NextAuthJWT }) {
  if (typeof NextAuthJWT.encode !== 'function') {
    NextAuthJWT = NextAuthJWT.default;
  }

  if (typeof NextAuth !== 'function') {
    NextAuth = NextAuth.default;
  }

  if (inTesting) {
    process.env.NEXT_AUTH_URL = 'http://localhost:3333/api/auth';
  }

  const providers = [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Email(),
  ];

  const callbacks = {};

  callbacks.signIn = async function signIn(user, account, metadata) {
    // Deny access to users that are not yet registered
    if (account.provider === 'github' && metadata && metadata.id) {
      return await signInGithub(user, account, metadata);
    } else if (metadata.verificationRequest && account.type === 'email') {
      return await signInEmail(user, account, metadata);
    }
  };

  callbacks.jwt = async function jwt(token, user) {
    if (user) {
      token = { accessToken: user.id };
    }

    return token;
  };

  callbacks.session = async function session(session, token) {
    session.accessToken = token.accessToken;
    const data = await tables();
    const user = await data.users.get({ id: token.accessToken });

    if (user) {
      Object.assign(session.user, {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar,
      });
    }

    return session;
  };

  const options = {
    session: {
      jwt: true,
      secret: process.env.JWT_SECRET,
    },
    providers,
    callbacks,
    jwt: jwt({ NextAuthJWT }),
    adapter: createDbAdapter(),
  };

  const nextAuth = NextAuth(options);

  return adaptReqRes(nextAuth);
};

async function signInGithub(user, account, metadata) {
  const githubUser = {
    id: metadata.id,
    login: metadata.login,
    name: metadata.name,
    avatar: metadata.avatar_url,
    email: metadata.email,
  };

  let existingUser;
  const data = await tables();
  const userKeyId = `${account.provider}:${githubUser.id}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }
  if (!existingUser) {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    const newUser = {
      id: nanoid(),
      name: githubUser.name,
      last_login: Date.now(),
      avatar: githubUser.avatar,
      email: githubUser.email,
    };

    await data.users.put(newUser);

    const newUserKey = {
      id: `${account.provider}:${githubUser.id}`,
      user_id: newUser.id,
    };

    await data.userkeys.put(newUserKey);

    if (githubUser.email) {
      const newEmailUserKey = {
        id: `email:${githubUser.email}`,
        user_id: newUser.id,
      };

      await data.userkeys.put(newEmailUserKey);
    }

    existingUser = newUser;
  }

  user.accessToken = existingUser.id;

  return true;
}

async function signInEmail(user, account, metadata) {
  let existingUser;
  const data = await tables();
  const userKeyId = `email:${metadata.email}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }
  if (!existingUser) {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    const newUser = {
      id: nanoid(),
      name: '',
      email: metadata.email,
    };

    await data.users.put(newUser);

    const newEmailUserKey = {
      id: `email:${metadata.email}`,
      user_id: newUser.id,
      validation_msg_sent_at: Date.now(),
    };

    await data.userkeys.put(newEmailUserKey);

    existingUser = newUser;
  }

  user.accessToken = existingUser.id;

  return true;
}
