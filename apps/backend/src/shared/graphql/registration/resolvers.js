'use strict';

const tables = require('../../tables');
const { nanoid } = require('nanoid');
const { UserInputError } = require('apollo-server-lambda');

const resolvers = {
  Mutation: {
    async createUserViaMagicLink(_, { email }) {
      const data = await tables();

      const key = `email:${email}`;
      const alreadyExistingKey = await data.userkeys.get({ id: key });
      if (alreadyExistingKey) {
        throw new UserInputError('The given email address is already in use');
      }

      const newUser = {
        id: nanoid(),
        name: '',
      };

      await data.users.put(newUser);

      const newKey = {
        id: key,
        user_id: newUser.id,
      };

      await data.userkeys.put(newKey);

      return newUser;
    },

    async resendRegistrationMagicLinkEmail(_, { email }) {
      const data = await tables();

      const keyId = `email:${email}`;
      const key = await data.userkeys.get({ id: keyId });

      if (!key) {
        throw new UserInputError('User key not found');
      }
      if (key.validated_at) {
        throw new UserInputError('User key already validated');
      }

      key.validation_msg_sent_at = Date.now();

      await data.userkeys.put(key);

      return true;
    },
  },
};

module.exports = resolvers;
