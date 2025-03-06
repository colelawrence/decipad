import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { notAcceptable } from '@hapi/boom';
import { server } from '@decipad/backend-notebook';
import handle from '../handle';
import { parseBody } from '@decipad/backend-utils';

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
    if (!action) {
      throw notAcceptable('No action parameter');
    }
    const body = parseBody(event);

    const response = await server(event, notebookId, action as any, {
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
