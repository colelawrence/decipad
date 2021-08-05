import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
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
    return {
      didEncounterErrors(rc) {
        if (!hasSentry) {
          return;
        }
        withScope((scope) => {
          scope.clear();
          scope.addEventProcessor((event) =>
            Handlers.parseRequest(event, rc.context.event)
          );

          const userId = rc.context.user?.id;
          if (userId) {
            scope.setUser({
              id: userId,
            });
          }

          scope.setTags({
            graphql: rc.operation?.operation || 'parse_err',
            graphqlName: rc.operationName || rc.request.operationName,
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
        });
      },
    };
  },
} as ApolloServerPlugin;
