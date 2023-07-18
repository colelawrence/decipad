import { GraphqlContext, Workspace } from '@decipad/backendtypes';
import {
  incrementQueryCount,
  getWorkspaceExecutedQuery,
} from './queries.helpers';

export default {
  Workspace: {
    async workspaceExecutedQuery(
      workspace: Workspace,
      _: unknown,
      context: GraphqlContext
    ) {
      return getWorkspaceExecutedQuery(workspace.id, context);
    },
  },

  Mutation: {
    incrementQueryCount: async (_: unknown, args: { id: string }) => {
      const workspaceId = args.id;
      return incrementQueryCount(workspaceId);
    },
  },
};
