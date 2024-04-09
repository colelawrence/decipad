import { timestamp } from '@decipad/backend-utils';
import { type WorkspaceExecutedQueryRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { track } from '@decipad/backend-analytics';
import { GraphQLError } from 'graphql';
import { limits } from '@decipad/backend-config';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import Boom from '@hapi/boom';

export const getWorkspaceExecutedQuery = async (
  workspaceId: string
): Promise<WorkspaceExecutedQueryRecord | undefined> => {
  const data = await tables();
  return data.workspacexecutedqueries.get({ id: workspaceId });
};

export const incrementQueryCount = async (
  event: APIGatewayProxyEventV2,
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
  const maxQueriesPerPlan = workspace.isPremium
    ? limits().maxQueries.pro
    : limits().maxQueries.free;

  if (!executedQuery) {
    const execQuery = {
      queryCount: 1,
      query_reset_date: timestamp(),
      quotaLimit: maxQueriesPerPlan,
      id: workspaceId,
    };

    await data.workspacexecutedqueries.put(execQuery);

    return execQuery;
  }
  // eslint-disable-next-line camelcase
  const { queryCount } = executedQuery;

  if (queryCount >= maxQueriesPerPlan) {
    await track(event, {
      event: 'Query execution limit exceeded',
      properties: {
        workspaceId,
        isPremium: !!workspace.isPremium,
      },
    });
    throw Boom.tooManyRequests(
      `Query execution limit of ${maxQueriesPerPlan}/month exceeded.`,
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

    await track(event, {
      event: 'Query execution updated',
      properties: {
        workspaceId,
        isPremium: !!workspace.isPremium,
        queryCount: queryCount.toString(),
      },
    });

    return newQuery;
  }
};
