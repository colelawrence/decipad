'use strict';

const { AuthenticationError } = require('apollo-server-lambda');
const tables = require('../../tables');
const { requireUser } = require('../authorization');

const resolvers = {
  Query: {
    self(parent, args, context) {
      return context.user;
    },
  },

  Mutation: {
    async updateSelf(_, args, context) {
      const user = requireUser(context);

      const data = await tables();

      const self = await data.users.get({ id: user.id });
      if (!self) {
        throw new AuthenticationError();
      }

      Object.assign(self, args.props, { id: user.id });

      await data.users.put(self);

      return self;
    },
  },
};

module.exports = resolvers;
