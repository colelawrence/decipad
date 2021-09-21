import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { wrapHandler } from '@decipad/services/monitor';

type Handler = (req: APIGatewayProxyEvent) => Promise<any>;

export default (handler: Handler) => {
  return wrapHandler(
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
      } catch (err) {
        console.error(err);
        return {
          statusCode: 500,
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }),
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
