import { boomify } from '@hapi/boom';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { trace } from '@decipad/backend-trace';

type Handler = (req: APIGatewayProxyEvent) => Promise<any>;

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
        if (body === null || body === undefined) {
          statusCode = 404;
        }

        if (body && typeof body !== 'string') {
          body = JSON.stringify(body);
        }

        return {
          statusCode,
          body,
          headers,
        };
      } catch (_err) {
        const err = boomify(_err as Error);
        if (err.isServer) {
          console.error('Error caught while processing request', req);
          console.error((_err as Error).message);
          console.error((_err as Error).stack);
          console.log(_err);
          throw err; // throw error for wrapper to log and handle
        }
        return {
          statusCode: err.output.statusCode,
          headers: getErrorHeaders(err.output.headers),
          body: JSON.stringify(err.output.payload),
        };
      }
    }
  );
};

function isFullReturnObject(result: any) {
  return result && (!!result.statusCode || !!result.body);
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
