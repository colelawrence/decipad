import tables from '../../tables';
import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';

export default {
  Mutation: {
    async createUserViaMagicLink(_: any, { email }: { email: string }): Promise<User> {
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

      await data.users.put(newUser);

      const newKey = {
        id: key,
        user_id: newUser.id,
      };

      await data.userkeys.put(newKey);

      return newUser;
    },

    async resendRegistrationMagicLinkEmail(_: any, { email }: { email: string }) {
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
