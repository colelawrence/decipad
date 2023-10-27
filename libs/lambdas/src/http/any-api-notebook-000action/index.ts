import { server } from '@decipad/backend-notebook';
import type {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import { notAcceptable } from '@hapi/boom';
import handle from '../handle';

const parseBody = (event: APIGatewayProxyEventV2): Record<string, unknown> => {
  if (event.body) {
    const body = (
      event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body, 'utf-8')
    ).toString('utf-8');

    console.log('BODY', body);

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (err) {
      throw notAcceptable('Error parsing JSON body');
    }
    if (parsedBody && typeof parsedBody !== 'object') {
      console.log('parsed body %j', parsedBody);
      throw notAcceptable('JSON body should be an object');
    }

    return parsedBody ?? {};
  }
  return {};
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
} as const;

export const handler: APIGatewayProxyHandlerV2 = handle(
  async (event) => {
    console.log('Decipad notebook action', event);
    if (event.requestContext.http.method === 'OPTIONS') {
      const response = {
        statusCode: 204,
        headers: corsHeaders,
      };
      console.log('Replying', response);
      return response;
    }
    const { notebookId, ...rest } = event.queryStringParameters ?? {};
    const { action } = event.pathParameters ?? {};
    const body = parseBody(event);

    const response = await server(notebookId, action as any, {
      ...rest,
      ...body,
    });
    response.headers = {
      ...response.headers,
      ...corsHeaders,
      'Content-Type': 'application/json',
    };
    return response;
  },
  { cors: true }
);
