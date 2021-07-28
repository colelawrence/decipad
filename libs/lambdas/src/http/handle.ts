import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { HttpResponse } from '@architect/functions';
import { wrapHandler } from '@decipad/services/monitor';

type Handler = (req: APIGatewayProxyEvent) => Promise<string | HttpResponse>;

export default (handler: Handler) => {
  return wrapHandler(
    async (req: APIGatewayProxyEvent): Promise<HttpResponse> => {
      try {
        const result = await handler(req);
        if (result === null || result === undefined) {
          return {
            statusCode: 404,
          };
        }

        if (typeof result === 'string') {
          return {
            statusCode: okStatusCodeFor(req),
            body: result,
            headers: {
              'content-type': 'text/plain',
            },
          };
        }
        if (isFullReturnObject(result)) {
          return result;
        }
        return {
          statusCode: okStatusCodeFor(req),
          headers: {
            'content-type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(result),
        };
      } catch (err) {
        console.error(err);
        return {
          statusCode: 500,
          json: {
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
        };
      }
    }
  );
};

function isFullReturnObject(result: HttpResponse) {
  return !!result.statusCode || !!result.json;
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
