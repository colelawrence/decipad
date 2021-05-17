'use strict';

const { createHash } = require('crypto');
const tables = require('../tables');

function createAdapter() {
  async function getAdapter({ secret, ...appOptions }) {
    const data = await tables();

    async function createUser(_profile) {
      return null;
    }

    function getUser(id) {
      return data.users.get({ id });
    }

    async function getUserByEmail(email) {
      const id = `email:${email}`;
      const key = await data.userkeys.get({ id });
      let user;
      if (key) {
        user = await data.users.get({ id: key.user_id });
      }

      return user;
    }

    async function getUserByProviderAccountId(providerId, providerAccountId) {
      const userkey = await data.userkeys.get({
        id: `${providerId}:${providerAccountId}`,
      });
      let user;
      if (userkey) {
        user = await data.users.get({ id: userkey.user_id });
      }

      return user;
    }

    async function updateUser(user) {
      if (user.emailVerified) {
        const verifiedAt = new Date(user.emailVerified);
        const userkey = await data.userkeys.get({
          id: `email:${user.email}`,
        });

        if (userkey) {
          userkey.validated_at = verifiedAt.getTime();

          await data.userkeys.put(userkey);
        }
      }

      const previousUser = data.users.get({ id: user.id });
      const newUser = Object.assign(previousUser, user);
      await data.users.put(user);
      return newUser;
    }

    async function deleteUser(_userId) {
      return null;
    }

    async function linkAccount(
      userId,
      providerId,
      providerType,
      providerAccountId,
      refreshToken,
      accessToken,
      accessTokenExpires
    ) {
      console.log('linkAccount', {
        userId,
        providerId,
        providerType,
        providerAccountId,
        refreshToken,
        accessToken,
        accessTokenExpires,
      });
      return null;
    }

    async function unlinkAccount(userId, providerId, providerAccountId) {
      console.log('unlinkAccount', { userId, providerId, providerAccountId });
      return null;
    }

    /* Only for username / password */

    async function getUserByCredentials(credentials) {
      console.log('getUserByCredentials', credentials);
      return null;
    }

    /* for when not using JWTs */

    async function createSession(user) {
      console.log('createSession', user);
      return null;
    }

    async function getSession(sessionToken) {
      console.log('getSession', sessionToken);
      return null;
    }

    async function updateSession(session, force) {
      console.log('updateSession', { session, force });
      return null;
    }

    async function deleteSession(sessionToken) {
      console.log('deleteSession', sessionToken);
      return null;
    }

    /* e-mail / passwordless verification request  */

    async function createVerificationRequest(
      identifier,
      url,
      token,
      secret,
      provider
    ) {
      const hashedToken = hashToken(token);

      const newVerificationRequest = {
        id: hashToken(`${identifier}:${hashedToken}:${secret}`),
        identifier,
        token: hashedToken,
        expires:
          Math.round(Date.now() / 1000) +
          Number(process.env.DECI_VERIFICATION_EXPIRES_SECONDS || 86400),
      };

      await data.verificationrequests.put(newVerificationRequest);

      await provider.sendVerificationRequest({
        identifier,
        url,
        token,
        baseUrl: appOptions.baseUrl,
        provider,
      });
    }

    async function getVerificationRequest(identifier, token, secret) {
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}:${secret}`);
      const verificationRequest = await data.verificationrequests.get({ id });

      return verificationRequest;
    }

    async function deleteVerificationRequest(identifier, token, secret) {
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}:${secret}`);
      await data.verificationrequests.delete({ id });
    }

    function hashToken(token) {
      return createHash('sha256').update(`${token}${secret}`).digest('hex');
    }

    return {
      createUser,
      getUser,
      getUserByEmail,
      getUserByProviderAccountId,
      getUserByCredentials,
      updateUser,
      deleteUser,
      linkAccount,
      unlinkAccount,
      createSession,
      getSession,
      updateSession,
      deleteSession,
      createVerificationRequest,
      getVerificationRequest,
      deleteVerificationRequest,
    };
  }

  return {
    getAdapter,
  };
}

module.exports = createAdapter;
