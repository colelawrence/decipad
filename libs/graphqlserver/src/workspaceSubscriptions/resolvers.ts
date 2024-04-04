import { getWorkspaceSubscription } from './subscription.helpers';
import type { Resolvers } from '@decipad/graphqlserver-types';
import { syncWorkspaceSeats } from './syncWorkspaceSeats';

const resolvers: Resolvers = {
  Workspace: {
    async workspaceSubscription(workspace) {
      return getWorkspaceSubscription(workspace.id);
    },
  },

  Mutation: {
    syncWorkspaceSeats,
  },
};

export default resolvers;
