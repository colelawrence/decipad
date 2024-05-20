import {
  getResourceUsage,
  incrementResourceUsage,
  updateExtraAiAllowance,
} from './queries.helpers';
import type { Resolvers } from '@decipad/graphqlserver-types';

const resolvers: Resolvers = {
  Mutation: {
    async updateExtraAiAllowance(
      _,
      { resourceType, resourceId, paymentMethodId },
      ctx
    ) {
      if (resourceType !== 'users' && resourceType !== 'workspaces') {
        // should be one of the two.
        return undefined;
      }

      if (!ctx.user) {
        return undefined;
      }

      return updateExtraAiAllowance(
        resourceType,
        resourceId,
        paymentMethodId,
        ctx.user
      );
    },
    async incrementResourceUsage(_, { resourceType, workspaceId, amount }) {
      return incrementResourceUsage(resourceType, workspaceId, amount);
    },
  },
  Workspace: {
    async resourceUsages(workspace) {
      return Promise.all([
        getResourceUsage('openai', workspace.id),
        getResourceUsage('storage', workspace.id),
        getResourceUsage('queries', workspace.id),
      ]);
    },
  },
};

export default resolvers;
