import { getAiUsage } from './queries.helpers';
import { Resolvers } from '@decipad/graphqlserver-types';

const resolvers: Resolvers = {
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
