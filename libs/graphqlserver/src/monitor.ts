import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import {
  setTag,
  setExtra,
  addBreadcrumb,
  setExtras,
  setUser,
} from '@sentry/serverless';
import { GraphqlContext } from '@decipad/backendtypes';
import { GraphQLError } from 'graphql';
import { ForbiddenError, UserInputError } from 'apollo-server-lambda';
import { Class } from 'utility-types';
import { captureException } from '@decipad/backend-trace';

const UserErrors: Array<Class<Error>> = [ForbiddenError, UserInputError];

const isUserError = (error: GraphQLError) =>
  UserErrors.some((UserError) => error.originalError instanceof UserError);

const onError = async (rc: GraphQLRequestContext) => {
  setTag('kind', rc.operationName);
  setExtra('query', rc.request.query);
  setExtra('variables', rc.request.variables);
  if (rc.errors) {
    for (const error of rc.errors) {
      // eslint-disable-next-line no-console
      if (error.path || error.name !== 'GraphQLError') {
        addBreadcrumb({
          category: 'query-path',
          message: error?.path?.join(' > '),
          level: 'debug',
        });
        setExtras({
          path: error.path,
        });
      }

      if (!process.env.CI) {
        // eslint-disable-next-line no-console
        console.error(
          'error detected by graphql monitor',
          error,
          error.originalError
        );
      }

      const contextWithUser = rc as unknown as GraphqlContext;

      const userId = contextWithUser.user?.id;
      if (userId) {
        setUser({
          id: userId,
        });
      }
      if (!isUserError(error)) {
        // eslint-disable-next-line no-await-in-loop
        await captureException(error);
      }
    }
  }
};

export const monitor: ApolloServerPlugin = {
  async requestDidStart(rc: GraphQLRequestContext) {
    if (rc.errors) {
      onError(rc);
    }
    return {
      async didEncounterErrors(): Promise<void> {
        await onError(rc);
      },
    };
  },
};
