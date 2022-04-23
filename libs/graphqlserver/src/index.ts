import { HttpHandler } from '@architect/functions';
import { wrapHandler } from '@decipad/services/monitor';
import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import createServer from './server';

type AdditionalContext = {
  additionalHeaders?: Map<string, string>;
  event?: APIGatewayProxyEvent;
};
type Context = LambdaContext & AdditionalContext;

export default function createHandler(): HttpHandler {
  const server = createServer();
  const handler = server.createHandler();

  /* eslint-disable no-param-reassign */

  return wrapHandler(
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
  ) as HttpHandler;
}
