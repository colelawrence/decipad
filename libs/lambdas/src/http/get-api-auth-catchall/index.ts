import { HttpRequest } from '@architect/functions';
import { auth as authConfig } from '@decipad/config';
import { createAuthHandler, testUserAuth } from '../../auth-flow';

const auth = createAuthHandler();
const testUserPath = `/api/auth/${authConfig().testUserSecret}`;

type RequestWithRawPath = HttpRequest & { rawPath?: string };

export const handler = async (req: RequestWithRawPath) => {
  if (req.rawPath === testUserPath) {
    return testUserAuth();
  }

  return auth(req);
};
