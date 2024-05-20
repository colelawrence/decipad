import {
  getResourceUsage,
  incrementResourceUsage,
} from '../resource-usage/queries.helpers';
import { resourceusage } from '@decipad/services';
import type { Resolvers } from '@decipad/graphqlserver-types';

/**
 * @deprecated in favour of the 'resource-usage'.
 *
 * TODO: in about 2 weeks or so -> Delete this (because people don't refresh tabs)
 */
const resolvers: Resolvers = {
  Workspace: {
    async workspaceExecutedQuery(workspace) {
      const usage = await getResourceUsage('queries', workspace.id);
      const limit = await resourceusage.queries.getLimit(workspace.id);

      return {
        id: usage.id,
        queryCount: usage.consumption,
        quotaLimit: limit,
      };
    },
  },

  Mutation: {
    async incrementQueryCount(_, { id }) {
      const usage = await incrementResourceUsage('queries', id, 1);
      const limit = await resourceusage.queries.getLimit(id);

      return {
        id: usage.id,
        queryCount: usage.consumption,
        quotaLimit: limit,
      };
    },
  },
};

export default resolvers;
