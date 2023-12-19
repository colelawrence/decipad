import { Resolvers, User } from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import md5 from 'md5';

const maskName = (name: string): string => {
  return name.slice(0, 2);
};

const resolvers: Resolvers = {
  Query: {
    me(_, __, context) {
      return context.user as User;
    },
  },

  Permission: {
    async user(permission) {
      const data = await tables();
      return getDefined(
        await data.users.get({ id: permission.user.id })
      ) as User;
    },
    async givenBy(permission) {
      const data = await tables();
      return getDefined(
        await data.users.get({ id: permission.user.id })
      ) as User;
    },
  },
  User: {
    async username(_, __, context) {
      if (!context.user) {
        return '';
      }

      const data = await tables();
      const userKeys = (
        await data.userkeys.query({
          IndexName: 'byUserId',
          KeyConditionExpression: 'user_id = :user_id',
          ExpressionAttributeValues: {
            ':user_id': context.user.id,
          },
        })
      ).Items.filter((key) => key.id.startsWith('username:'));

      if (userKeys.length === 0) {
        return '';
      }

      const [userKey] = userKeys;
      const username = userKey.id.split(':')[1];
      return username;
    },
    // This represents the email hash to be used by gravatar component
    async image(user) {
      const { email } = user;

      return email ? md5(email, { encoding: 'binary' }) : '';
    },
    async name(user, _, context) {
      const { name } = user;

      if (!context.readingModePermission) {
        return name;
      }

      return maskName(name);
    },
    async email(user, _, context) {
      const { email } = user;

      return email && !context.readingModePermission ? email : '';
    },
    async emailValidatedAt(user) {
      const data = await tables();
      const userKeys = (
        await data.userkeys.query({
          IndexName: 'byUserId',
          KeyConditionExpression: 'user_id = :user_id',
          ExpressionAttributeValues: {
            ':user_id': user.id,
          },
        })
      ).Items.filter((key) => key.id.startsWith('email:'));

      if (userKeys.length === 0) {
        return;
      }
      const [userKey] = userKeys;
      return (
        (userKey.validated_at != null && new Date(userKey.validated_at)) ||
        undefined
      );
    },
  },
};
export default resolvers;
