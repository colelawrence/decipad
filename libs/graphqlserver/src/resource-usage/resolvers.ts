import {
  getAiUsage,
  getStorageUsage,
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
  },
  User: {
    async resourceUsages(user) {
      return getAiUsage('users', user.id);
    },
  },
  Workspace: {
    async resourceUsages(workspace) {
      const usages = await Promise.all([
        getAiUsage('workspaces', workspace.id),
        getStorageUsage(workspace.id),
      ]);

      return usages.flat();
    },
  },
};

export default resolvers;
