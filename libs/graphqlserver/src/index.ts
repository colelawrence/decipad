import {
  APIGatewayProxyCallback,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context as LambdaContext,
  Handler,
} from 'aws-lambda';
import { trace } from '@decipad/backend-trace';
import createServer from './server';
import { debug } from './debug';

type AdditionalContext = {
  additionalHeaders?: Map<string, string>;
  event?: APIGatewayProxyEventV2;
};
type Context = LambdaContext & AdditionalContext;

export default function createHandler(): Handler {
  const server = createServer();
  const handler = server.createHandler({
    expressGetMiddlewareOptions: { bodyParserConfig: { limit: '6mb' } },
  });

  /* eslint-disable no-param-reassign */

  return trace(
    (event, context: Context, _callback: APIGatewayProxyCallback) => {
      let calledBack = false;
      const callback = (
        err: Error | null | undefined | string,
        reply?: APIGatewayProxyResult
      ) => {
        if (calledBack) {
          return;
        }
        calledBack = true;
        if (!context?.additionalHeaders) {
          throw new Error('missing additional headers');
        }
        if (!reply) {
          throw new Error('missing reply');
        }

        if (!err && context?.additionalHeaders.size > 0) {
          if (!reply.headers) {
            reply.headers = {};
          }
          for (const [key, value] of context?.additionalHeaders ?? []) {
            reply.headers[key] = value;
          }
        }
        if (err) {
          // eslint-disable-next-line no-console
          console.error('replying with error', err);
        }
        _callback(err, reply);
      };

      if (context) {
        context.event = event;
        context.additionalHeaders = new Map();
      }

      const adaptedEvent = {
        ...event,
        httpMethod:
          'httpMethod' in event && event.httpMethod
            ? event.httpMethod
            : (event.requestContext as unknown as { http: { method: string } })
                .http.method,
        path: (event.requestContext as unknown as { http: { path: string } })
          .http.path,
      };

      debug('adaptedEvent: %j', adaptedEvent);

      const p = handler(adaptedEvent, context as Context, callback);
      if (p) {
        p.then((result) => callback(null, result)).catch((err) =>
          callback(err)
        );
      }
    }
  ) as Handler;
}
