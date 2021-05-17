'use strict';

const tables = require('../../tables');

const resolvers = {
  Query: {
    me(parent, args, context /*, info*/) {
      return context.user;
    },
  },

  Permission: {
    async user(permission) {
      const data = await tables();
      return await data.users.get({ id: permission.user_id });
    },
    async givenBy(permission) {
      const data = await tables();
      return await data.users.get({ id: permission.given_by_user_id });
    },
  },
};

module.exports = resolvers;
