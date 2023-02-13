import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';
import { User } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/services/utils';

export default {
  Mutation: {
    async createUserViaMagicLink(
      _: unknown,
      { email }: { email: string }
    ): Promise<User> {
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

    async resendRegistrationMagicLinkEmail(
      _: unknown,
      { email }: { email: string }
    ) {
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
