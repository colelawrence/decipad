import { app, auth as authConfig } from '@decipad/backend-config';
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createAuthHandler, testUserAuth } from '@decipad/backend-auth';

const auth = createAuthHandler();
const testUserPath = `/api/auth/${authConfig().testUserSecret}`;

export const handler: APIGatewayProxyHandlerV2 = async (req, ...params) => {
  const url = new URL(
    `${req.rawPath || ''}?${req.rawQueryString || ''}`,
    app().urlBase
  );
  if (url.pathname === testUserPath) {
    return testUserAuth(req, url);
  }

  return auth(req, ...params) as Promise<APIGatewayProxyResultV2>;
};
