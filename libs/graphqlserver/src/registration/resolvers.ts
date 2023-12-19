import { nanoid } from 'nanoid';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { UserInputError } from 'apollo-server-lambda';
import { Resolvers } from '@decipad/graphqlserver-types';

const resolvers: Resolvers = {
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
        email,
        secret: nanoid(),
      };

      await data.users.create(newUser);

      const newKey = {
        id: key,
        user_id: newUser.id,
      };

      await data.userkeys.create(newKey);

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

      key.validation_msg_sent_at = timestamp();

      await data.userkeys.create(key);

      return true;
    },
  },
};

export default resolvers;
