import { resource } from '@decipad/backend-resources';
import { timestamp } from '@decipad/backend-utils';
import {
  GraphqlContext,
  WorkspaceExecutedQueryRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { track } from '@decipad/backend-analytics';
import { isSameMonth, addMonths } from 'date-fns';
import { GraphQLError } from 'graphql';

export const MAX_CREDITS_EXEC_COUNT = {
  free: 50,
  pro: 500,
};

const workspacesResource = resource('workspace');

export const getWorkspaceExecutedQuery = async (
  workspaceId: string,
  context: GraphqlContext
): Promise<WorkspaceExecutedQueryRecord | undefined> => {
  await workspacesResource.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

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
  const { queryCount, query_reset_date } = executedQuery;

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
    const currentDate = timestamp();
    // eslint-disable-next-line camelcase
    const shouldResetDate = query_reset_date
      ? isSameMonth(currentDate, addMonths(query_reset_date, 1))
      : true;

    let newQueryResetDate;
    let newQueryCount;

    // eslint-disable-next-line camelcase
    if (shouldResetDate) {
      newQueryCount = 1;
      newQueryResetDate = currentDate;
    } else {
      newQueryCount = (queryCount || 0) + 1;
    }
    const newQuery = {
      ...executedQuery,
      queryCount: newQueryCount,
      // eslint-disable-next-line camelcase
      query_reset_date: newQueryResetDate || query_reset_date,
    };

    await data.workspacexecutedqueries.put(newQuery);

    return newQuery;
  }
};
