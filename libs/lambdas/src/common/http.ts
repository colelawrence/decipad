import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { Payload } from '@hapi/boom';

const allowedErrorKeys = new Set<keyof Payload>([
  'statusCode',
  'error',
  'message',
]);
export const sanitizeErrorPayload = (payload: Payload): Payload =>
  Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedErrorKeys.has(key))
  ) as Payload;

export function isFullReturnObject(
  result: unknown
): result is APIGatewayProxyStructuredResultV2 {
  return (
    result != null &&
    typeof result === 'object' &&
    ('statusCode' in result || 'body' in result)
  );
}

export function okStatusCodeFor(req: APIGatewayProxyEvent) {
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

export function getErrorHeaders(
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
