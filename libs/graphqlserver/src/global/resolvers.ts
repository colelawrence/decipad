import {
  GraphqlContext,
  PermissionRecord,
  User,
  UserRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import md5 from 'md5';

const maskName = (name: string): string => {
  return name.slice(0, 2);
};

export default {
  Query: {
    me(_: unknown, __: unknown, context: GraphqlContext): User | undefined {
      return context.user;
    },
  },

  Permission: {
    async user(permission: PermissionRecord): Promise<User | undefined> {
      const data = await tables();
      return data.users.get({ id: permission.user_id });
    },
    async givenBy(permission: PermissionRecord): Promise<User | undefined> {
      const data = await tables();
      return data.users.get({ id: permission.given_by_user_id });
    },
  },
  User: {
    async username(
      _: unknown,
      __: unknown,
      context: GraphqlContext
    ): Promise<string | undefined> {
      if (!context.user) {
        return;
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
        return;
      }

      const [userKey] = userKeys;
      const username = userKey.id.split(':')[1];
      return username;
    },
    // This represents the email hash to be used by gravatar component
    async image(user: UserRecord): Promise<string | undefined> {
      const { email } = user;

      return email ? md5(email, { encoding: 'binary' }) : undefined;
    },
    async name(
      user: UserRecord,
      _: unknown,
      context: GraphqlContext
    ): Promise<string | undefined> {
      const { name } = user;

      if (!context.readingModePermission) {
        return name;
      }

      return maskName(name);
    },
    async email(
      user: UserRecord,
      _: unknown,
      context: GraphqlContext
    ): Promise<string | undefined> {
      const { email } = user;

      return email && !context.readingModePermission ? email : undefined;
    },
    async emailValidatedAt(user: UserRecord): Promise<Date | undefined> {
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
