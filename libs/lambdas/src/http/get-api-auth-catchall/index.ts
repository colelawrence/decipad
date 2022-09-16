import { app, auth as authConfig } from '@decipad/config';
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createAuthHandler, testUserAuth } from '../../auth-flow';

const auth = createAuthHandler();
const testUserPath = `/api/auth/${authConfig().testUserSecret}`;

export const handler: APIGatewayProxyHandlerV2 = async (req, ...params) => {
  const url = new URL(
    `${req.rawPath || ''}?${req.rawQueryString || ''}`,
    app().urlBase
  );
  if (url.pathname === testUserPath) {
    return testUserAuth(url);
  }

  return auth(req, ...params) as Promise<APIGatewayProxyResultV2>;
};
