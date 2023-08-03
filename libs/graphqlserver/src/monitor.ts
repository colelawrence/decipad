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
import { boomify } from '@hapi/boom';
import { debug } from './debug';

const UserErrors: Array<Class<Error>> = [ForbiddenError, UserInputError];

const isGraphqlUserError = (error: Error): boolean =>
  UserErrors.some((UserError) => error instanceof UserError);

const isServerError = (error: Error): boolean => {
  const b = boomify(error);
  return b.isServer;
};

const isUserError = (error: GraphQLError): boolean =>
  isGraphqlUserError(error) ||
  !isServerError(error) ||
  (error.originalError instanceof Error &&
    (isGraphqlUserError(error.originalError) ||
      !isServerError(error.originalError)));

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

      const shouldCaptureError = !isUserError(error);

      if (shouldCaptureError) {
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
      if (shouldCaptureError) {
        // eslint-disable-next-line no-await-in-loop
        await captureException(error);
      }
    }
  }
};

export const monitor: ApolloServerPlugin = {
  async requestDidStart(rc: GraphQLRequestContext) {
    debug('request started', rc.operationName);
    if (rc.errors) {
      await onError(rc);
    }
    return {
      async didEncounterErrors(): Promise<void> {
        await onError(rc);
      },
    };
  },
};
