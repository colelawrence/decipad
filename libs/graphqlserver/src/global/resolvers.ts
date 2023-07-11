import {
  GraphqlContext,
  PermissionRecord,
  User,
  UserRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';

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
