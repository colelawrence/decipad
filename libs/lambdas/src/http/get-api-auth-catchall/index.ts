import { HttpRequest } from '@architect/functions';
import { app, auth as authConfig } from '@decipad/config';
import { createAuthHandler, testUserAuth } from '../../auth-flow';

const auth = createAuthHandler();
const testUserPath = `/api/auth/${authConfig().testUserSecret}`;

type RequestWithRawPath = HttpRequest & {
  rawPath?: string;
  rawQueryString?: string;
};

export const handler = async (req: RequestWithRawPath) => {
  const url = new URL(
    `${req.rawPath || ''}?${req.rawQueryString || ''}`,
    app().urlBase
  );
  if (url.pathname === testUserPath) {
    return testUserAuth(url);
  }

  return auth(req);
};
