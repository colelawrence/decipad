import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import { withScope, captureException } from '@sentry/serverless';
import { GraphqlContext } from '@decipad/backendtypes';

const onError = (rc: GraphQLRequestContext) => {
  withScope((scope) => {
    scope.clear();
    scope.setTag('kind', rc.operationName);
    scope.setExtra('query', rc.request.query);
    scope.setExtra('variables', rc.request.variables);
    if (rc.errors) {
      for (const error of rc.errors) {
        // eslint-disable-next-line no-console
        if (error.path || error.name !== 'GraphQLError') {
          scope.addBreadcrumb({
            category: 'query-path',
            message: error?.path?.join(' > '),
            level: 'debug',
          });
          scope.setExtras({
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
          scope.setUser({
            id: userId,
          });
        }
        captureException(error, scope);
      }
    }
  });
};

export const monitor: ApolloServerPlugin = {
  async requestDidStart(rc: GraphQLRequestContext) {
    if (rc.errors) {
      onError(rc);
    }
    return {
      async didEncounterErrors(): Promise<void> {
        onError(rc);
      },
    };
  },
};
