'use strict';

const resolvers = {
  Query: {
    me(parent, args, context /*, info*/) {
      return context.user;
    },
  },
};

module.exports = resolvers;
