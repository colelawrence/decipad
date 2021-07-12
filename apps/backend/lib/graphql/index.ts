import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyCallback,
  Context as LambdaContext,
} from 'aws-lambda';
import { HttpHandler } from '@architect/functions';
import createServer from './server';
import { wrapHandler } from '../monitor';

type AdditionalContext = {
  additionalHeaders?: Map<string, string>;
  event?: APIGatewayProxyEvent;
};
type Context = LambdaContext & AdditionalContext;

export default function createHandler(): HttpHandler {
  const server = createServer();
  const handler = server.createHandler();

  return wrapHandler(
    (
      event: APIGatewayProxyEvent,
      context: Context,
      _callback: APIGatewayProxyCallback
    ) => {
      const callback = (
        err: Error | null | undefined | string,
        reply: APIGatewayProxyResult | undefined
      ) => {
        if (!err && context.additionalHeaders!.size > 0) {
          if (!reply!.headers) {
            reply!.headers = {};
          }
          for (const [key, value] of context.additionalHeaders!) {
            reply!.headers[key] = value;
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
      handler(event, context, callback);
    }
  ) as HttpHandler;
}
