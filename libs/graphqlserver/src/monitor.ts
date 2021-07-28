import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import {
  withScope,
  Handlers,
  captureException,
  captureMessage,
} from '@sentry/serverless';
import { monitor as monitorConfig } from '@decipad/config';

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const hasSentry = !!sentryDSN;

export default {
  requestDidStart() {
    return Promise.resolve({
      didEncounterErrors(rc) {
        return new Promise((resolve) => {
          if (!hasSentry) {
            return resolve();
          }
          withScope((scope) => {
            scope.clear();
            scope.addEventProcessor((event) =>
              Handlers.parseRequest(event, (rc.context as any).event)
            );

            const userId = (rc.context as any).user?.id;
            if (userId) {
              scope.setUser({
                id: userId,
              });
            }

            scope.setTags({
              graphql: rc.operation?.operation || 'parse_err',
              graphqlName:
                (rc.operationName as any) || (rc.request.operationName as any),
            });

            rc.errors.forEach((error) => {
              if (error.path || error.name !== 'GraphQLError') {
                scope.setExtras({
                  path: error.path,
                });
                captureException(error, scope);
              } else {
                scope.setExtras({});
                captureMessage(`GraphQLWrongQuery: ${error.message}`, scope);
              }
            });

            resolve();
          });
        });
      },
    });
  },
} as ApolloServerPlugin;
