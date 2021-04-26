'use strict';

const arc = require('@architect/functions');

function createAdapter() {
  async function getAdapter(/*appOptions*/) {
    const tables = await arc.tables();

    async function createUser(profile) {
      console.log('ADAPTER: createUser:', profile);
      return null;
    }

    function getUser(id) {
      console.log('ADAPTER: getUser:', id);
      return tables.users.get({ id });
    }

    async function getUserByEmail(email) {
      console.log('ADAPTER: getUserByEmail:', email);
      const id = `email:${email}`;
      const key = await tables.userkeys.get({ id });
      let user;
      if (key) {
        user = await tables.users.get({ id: key.user_id });
      }

      return user;
    }

    async function getUserByProviderAccountId(providerId, providerAccountId) {
      console.log('ADAPTER: getUserByProviderAccountId:', {
        providerId,
        providerAccountId,
      });
      const userkey = await tables.userkeys.get({
        id: `${providerId}:${providerAccountId}`,
      });
      let user;
      if (userkey) {
        user = await tables.users.get({ id: userkey.user_id });
      }

      return user;
    }

    async function updateUser(user) {
      console.log('ADAPTER: updateUser:', user);
      return null;
    }

    async function deleteUser(userId) {
      console.log('ADAPTER: deleteUser:', userId);
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
      console.log('createVerificationRequest', {
        identifier,
        url,
        token,
        secret,
        provider,
      });
      return null;
    }

    async function getVerificationRequest(identifier, token, secret, provider) {
      console.log('getVerificationRequest', {
        identifier,
        token,
        secret,
        provider,
      });
      return null;
    }

    async function deleteVerificationRequest(
      identifier,
      token,
      secret,
      provider
    ) {
      console.log('deleteVerificationRequest', {
        identifier,
        token,
        secret,
        provider,
      });
      return null;
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
