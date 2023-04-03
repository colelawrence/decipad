import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
  Handler,
} from 'aws-lambda';
import { trace } from '@decipad/backend-trace';
import createServer from './server';

type AdditionalContext = {
  additionalHeaders?: Map<string, string>;
  event?: APIGatewayProxyEvent;
};
type Context = LambdaContext & AdditionalContext;

export default function createHandler(): Handler {
  const server = createServer();
  const handler = server.createHandler({
    expressGetMiddlewareOptions: { bodyParserConfig: { limit: '6mb' } },
  });

  /* eslint-disable no-param-reassign */

  return trace(
    (
      event: APIGatewayProxyEvent,
      context: Context,
      _callback: APIGatewayProxyCallback
    ) => {
      let calledBack = false;
      const callback = (
        err: Error | null | undefined | string,
        reply?: APIGatewayProxyResult
      ) => {
        if (calledBack) {
          return;
        }
        calledBack = true;
        if (!context.additionalHeaders) {
          throw new Error('missing additional headers');
        }
        if (!reply) {
          throw new Error('missing reply');
        }

        if (!err && context.additionalHeaders.size > 0) {
          if (!reply.headers) {
            reply.headers = {};
          }
          for (const [key, value] of context.additionalHeaders) {
            reply.headers[key] = value;
          }
        }
        if (err) {
          // eslint-disable-next-line no-console
          console.error('replying with error', err);
        }
        _callback(err, reply);
      };

      context.event = event;
      context.additionalHeaders = new Map();

      event.httpMethod = event.httpMethod
        ? event.httpMethod
        : (event.requestContext as unknown as { http: { method: string } }).http
            .method;

      event.path = (
        event.requestContext as unknown as { http: { path: string } }
      ).http.path;

      const p = handler(event, context, callback);
      if (p) {
        p.then((result) => callback(null, result)).catch((err) =>
          callback(err)
        );
      }
    }
  );
}
