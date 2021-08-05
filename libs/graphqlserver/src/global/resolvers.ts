import { GraphqlContext, PermissionRecord, User } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';

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
};
