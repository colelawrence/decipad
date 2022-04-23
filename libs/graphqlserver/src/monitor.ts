import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import { withScope, captureException, Severity } from '@sentry/serverless';
import { monitor as monitorConfig } from '@decipad/config';
import { GraphqlContext } from '@decipad/backendtypes';

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const hasSentry = !!sentryDSN;

export const monitor: ApolloServerPlugin = {
  async requestDidStart(rc: GraphQLRequestContext) {
    return {
      async didEncounterErrors(): Promise<void> {
        if (!hasSentry) {
          return;
        }
        withScope((scope) => {
          scope.clear();
          scope.setTag('kind', rc.operationName);
          scope.setExtra('query', rc.request.query);
          scope.setExtra('variables', rc.request.variables);
          if (rc.errors) {
            for (const error of rc.errors) {
              // eslint-disable-next-line no-console
              console.error(error);
              if (error.path || error.name !== 'GraphQLError') {
                scope.addBreadcrumb({
                  category: 'query-path',
                  message: error?.path?.join(' > '),
                  level: Severity.Debug,
                });
                scope.setExtras({
                  path: error.path,
                });
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
      },
    };
  },
};
