import { APIGatewayProxyResultV2 as HttpResponse } from 'aws-lambda';
import handle from '../handle';

export const handler = handle(async (req): Promise<HttpResponse> => {
  if (!req.queryStringParameters || !req.queryStringParameters.url) {
    return {
      statusCode: 400,
      body: 'Missing url',
    };
  }

  const title =
    decodeURIComponent(req.queryStringParameters.url)
      .split('/n/')[1]
      .split(':')[0]
      .replaceAll('-', ' ')
      .trim() || 'Decipad - Make sense of numbers';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'link',
      version: '1.0',
      title,
      provider_name: 'Decipad',
      provider_url: 'https://decipad.com',
    }),
  };
});
