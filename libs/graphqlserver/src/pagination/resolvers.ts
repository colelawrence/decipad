/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Resolvers } from '@decipad/graphqlserver-types';

const resolvers: Resolvers = {
  Pageable: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(obj) {
      return (obj as any).gqlType;
    },
  },
};

export default resolvers;
