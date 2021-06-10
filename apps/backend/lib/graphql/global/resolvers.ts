import tables from '../../tables';

export default {
  Query: {
    me(_: any, __: any, context: GraphqlContext): User | undefined {
      return context.user;
    },
  },

  Permission: {
    async user(permission: PermissionRecord): Promise<User> {
      const data = await tables();
      return await data.users.get({ id: permission.user_id });
    },
    async givenBy(permission: PermissionRecord): Promise<User> {
      const data = await tables();
      return await data.users.get({ id: permission.given_by_user_id });
    },
  },
};
