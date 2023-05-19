import stringify from 'json-stringify-safe';
import { boomify } from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { Handler } from '@decipad/backendtypes';
import { captureException, trace } from '@decipad/backend-trace';
import chalk from 'chalk';
import { inspect } from 'util';

export default (handler: Handler) => {
  return trace(
    async (req: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
      try {
        let body = await handler(req);
        if (isFullReturnObject(body)) {
          return body;
        }

        let statusCode = okStatusCodeFor(req);
        const headers = {
          'content-type': 'application/json; charset=utf-8',
        };
        if (body == null) {
          statusCode = 404;
        } else if (typeof body !== 'string') {
          body = stringify(body);
        }

        return {
          statusCode,
          body: body ?? '',
          headers,
        };
      } catch (_err) {
        const err = boomify(_err as Error);
        if (err.isServer) {
          console.error('Error caught while processing request', req);
          console.error((_err as Error).message);
          console.error((_err as Error).stack);
          console.log(_err);
          await captureException(err);
          throw err; // throw error for wrapper to log and handle
        }
        console.error(
          chalk.yellow(
            `User error caught while processing request:\n${inspect(
              req
            )}\nErr:\n${inspect(err)}`
          )
        );
        return {
          statusCode: err.output.statusCode,
          headers: getErrorHeaders(err.output.headers),
          body: stringify(err.output.payload),
        };
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

function getErrorHeaders(headers: Record<string, any>): Record<string, string> {
  const retEntries = new Map<string, string>();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      retEntries.set(key, value);
    }
  }
  return Object.fromEntries(retEntries.entries());
}
