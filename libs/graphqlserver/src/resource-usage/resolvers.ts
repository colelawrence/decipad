import { getAiUsage, updateExtraAiAllowance } from './queries.helpers';
import { Resolvers } from '@decipad/graphqlserver-types';

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
      return getAiUsage('workspaces', workspace.id);
    },
  },
};

export default resolvers;
