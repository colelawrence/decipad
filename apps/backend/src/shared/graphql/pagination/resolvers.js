'use strict';

const resolvers = {
  Pageable: {
    __resolveType(obj) {
      return obj.gqlType;
    },
  },
};

module.exports = resolvers;
