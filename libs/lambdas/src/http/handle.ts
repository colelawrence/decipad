import { inspect } from 'util';
import stringify from 'json-stringify-safe';
import { Payload, boomify } from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  ScheduledEvent,
} from 'aws-lambda';
import chalk from 'chalk';
import { Handler } from '@decipad/backendtypes';
import { captureException, trace } from '@decipad/backend-trace';
import { debug } from '../debug';

interface HandlerOptions {
  cors?: boolean;
}

const allowedErrorKeys = new Set<keyof Payload>([
  'statusCode',
  'error',
  'message',
]);
const sanitizeErrorPayload = (payload: Payload): Payload =>
  Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedErrorKeys.has(key))
  ) as Payload;

export default (handler: Handler, options: HandlerOptions = {}) => {
  return trace(
    async (
      req: APIGatewayProxyEvent | ScheduledEvent
    ): Promise<APIGatewayProxyResultV2> => {
      debug('request', req);
      try {
        if ('detail-type' in req && req['detail-type'] === 'Scheduled Event') {
          return {
            statusCode: 200,
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: '',
          };
        }

        let body = await handler(req as APIGatewayProxyEvent);
        if (isFullReturnObject(body)) {
          debug('response', body);
          return body;
        }

        let statusCode = okStatusCodeFor(req as APIGatewayProxyEvent);
        const headers = {
          'content-type': 'application/json; charset=utf-8',
        };
        if (body == null) {
          statusCode = 404;
        } else if (typeof body !== 'string') {
          body = stringify(body);
        }

        const response = {
          statusCode,
          body: body ?? '',
          headers,
        };
        debug('response', response);

        return response;
      } catch (_err) {
        const err = boomify(_err as Error);
        if (err.isServer) {
          console.error('Error caught while processing request', req);
          console.error((_err as Error).message);
          console.error((_err as Error).stack);
          console.log(_err);
          await captureException(err);
        } else {
          console.error(
            chalk.yellow(
              `User error caught while processing request:\n${inspect(
                req
              )}\nErr:\n${inspect(err)}`
            )
          );
        }
        const reply = {
          statusCode: err.output.statusCode,
          headers: getErrorHeaders(err.output.headers, options),
          body: stringify(sanitizeErrorPayload(err.output.payload)),
        };
        console.error('Replying with', reply);
        return reply;
      }
    }
  );
};

function isFullReturnObject(
  result: unknown
): result is APIGatewayProxyStructuredResultV2 {
  return (
    result != null &&
    typeof result === 'object' &&
    ('statusCode' in result || 'body' in result)
  );
}

function okStatusCodeFor(req: APIGatewayProxyEvent) {
  const verb = req.routeKey.split(' ')[0];
  switch (verb) {
    case 'PUT':
    case 'DELETE':
      return 202;
    case 'POST':
      return 201;
  }
  return 200;
}

function getErrorHeaders(
  headers: Record<string, any>,
  { cors }: { cors?: boolean } = {}
): Record<string, string> {
  const retEntries = new Map<string, string>();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      retEntries.set(key, value);
    }
  }
  const headersObj = Object.fromEntries(retEntries.entries());
  if (cors) {
    Object.assign(headersObj, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
  }
  return {
    ...headersObj,
    'Content-Type': 'application/json',
  };
}
