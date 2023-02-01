import { APIGatewayProxyResultV2 as HttpResponse } from 'aws-lambda';
import handle from '../handle';

export const handler = handle(async (): Promise<HttpResponse> => {
  return {
    statusCode: 200,
    headers: {
      'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
      'Content-Type': 'text/html',
    },
    body: '<p>Cache, cookies, storage and execution contexts cleared.</p><p><a href="/">Click here to continue</a></p>',
  };
});
