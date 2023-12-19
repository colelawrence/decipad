import { WorkspaceExecutedQueryRecord } from '@decipad/backendtypes';
import {
  incrementQueryCount,
  getWorkspaceExecutedQuery,
} from './queries.helpers';
import {
  Resolvers,
  WorkspaceExecutedQuery,
} from '@decipad/graphqlserver-types';

function workspaceExecutedQueryRecordToGraphql(
  record: WorkspaceExecutedQueryRecord | undefined
): WorkspaceExecutedQuery | null {
  if (!record) return null;
  return record as WorkspaceExecutedQuery;
}

const resolvers: Resolvers = {
  Workspace: {
    async workspaceExecutedQuery(workspace) {
      return workspaceExecutedQueryRecordToGraphql(
        await getWorkspaceExecutedQuery(workspace.id)
      );
    },
  },

  Mutation: {
    incrementQueryCount: async (_, { id }, context) => {
      return incrementQueryCount(context.event, id);
    },
  },
};

export default resolvers;
