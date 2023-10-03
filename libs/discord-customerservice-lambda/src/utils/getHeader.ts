import { APIGatewayProxyEventHeaders } from 'aws-lambda';

export function getHeader(
  name: string,
  headers: APIGatewayProxyEventHeaders
): string | undefined {
  const value = headers[name];
  if (value != null) {
    return value;
  }
  return headers[name.toLowerCase()];
}
