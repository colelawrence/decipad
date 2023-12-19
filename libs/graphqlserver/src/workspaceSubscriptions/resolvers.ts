import { getWorkspaceSubscription } from './subscription.helpers';
import { Resolvers } from '@decipad/graphqlserver-types';
import { syncWorkspaceSeats } from './syncWorkspaceSeats';

const resolvers: Resolvers = {
  Workspace: {
    async workspaceSubscription(workspace, _, context) {
      return getWorkspaceSubscription(workspace.id, context);
    },
  },

  Mutation: {
    syncWorkspaceSeats,
  },
};

export default resolvers;
