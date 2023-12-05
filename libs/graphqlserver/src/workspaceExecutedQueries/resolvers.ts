import { GraphqlContext, Workspace } from '@decipad/backendtypes';
import {
  incrementQueryCount,
  getWorkspaceExecutedQuery,
} from './queries.helpers';

export default {
  Workspace: {
    async workspaceExecutedQuery(workspace: Workspace) {
      return getWorkspaceExecutedQuery(workspace.id);
    },
  },

  Mutation: {
    incrementQueryCount: async (
      _: unknown,
      args: { id: string },
      context: GraphqlContext
    ) => {
      const workspaceId = args.id;
      return incrementQueryCount(context.event, workspaceId);
    },
  },
};
