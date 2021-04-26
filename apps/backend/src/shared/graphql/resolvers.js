'use strict';

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    me: (parent, args, context /*, info*/) => {
      return context.user;
    },
  },
};

module.exports = resolvers;
