import { timestamp } from '@decipad/backend-utils';
import {
  WorkspaceExecutedQueryRecord,
  MAX_CREDITS_EXEC_COUNT,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { track } from '@decipad/backend-analytics';
import { GraphQLError } from 'graphql';

export const getWorkspaceExecutedQuery = async (
  workspaceId: string
): Promise<WorkspaceExecutedQueryRecord | undefined> => {
  const data = await tables();
  return data.workspacexecutedqueries.get({ id: workspaceId });
};

export const incrementQueryCount = async (
  workspaceId: string
): Promise<WorkspaceExecutedQueryRecord> => {
  const data = await tables();

  const workspace = await data.workspaces.get({ id: workspaceId });

  if (!workspace) {
    throw new GraphQLError('Workspace does not exist!', {
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
      },
    });
  }

  const executedQuery = await data.workspacexecutedqueries.get({
    id: workspaceId,
  });
  const maxCreditsPerPlan = workspace.isPremium
    ? MAX_CREDITS_EXEC_COUNT.pro
    : MAX_CREDITS_EXEC_COUNT.free;

  if (!executedQuery) {
    const execQuery = {
      queryCount: 1,
      query_reset_date: timestamp(),
      quotaLimit: maxCreditsPerPlan,
      id: workspaceId,
    };

    await data.workspacexecutedqueries.put(execQuery);

    return execQuery;
  }
  // eslint-disable-next-line camelcase
  const { queryCount } = executedQuery;

  if (queryCount >= maxCreditsPerPlan) {
    await track({
      event: 'Query execution limit exceeded',
      properties: {
        workspaceId,
        isPremium: !!workspace.isPremium,
      },
    });
    throw new GraphQLError(
      `Query execution limit of ${maxCreditsPerPlan}/month exceeded.`,
      {
        extensions: {
          code: 'LIMIT_EXCEEDED',
        },
      }
    );
  } else {
    const newQuery = {
      ...executedQuery,
      queryCount: (queryCount || 0) + 1,
    };

    await data.workspacexecutedqueries.put(newQuery);

    return newQuery;
  }
};
