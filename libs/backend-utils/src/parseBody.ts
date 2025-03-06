import { notAcceptable } from '@hapi/boom';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const parseBody = async (
  event: APIGatewayProxyEventV2
): Promise<Record<string, unknown>> => {
  if (event.body) {
    const body = (
      event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body, 'utf-8')
    ).toString('utf-8');

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (_e) {
      throw notAcceptable('Error parsing JSON body');
    }
    if (parsedBody && typeof parsedBody !== 'object') {
      throw notAcceptable('JSON body should be an object');
    }

    return parsedBody ?? {};
  }
  return {};
};
