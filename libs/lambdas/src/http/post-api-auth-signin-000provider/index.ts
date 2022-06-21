import { HttpRequest } from '@architect/functions';
import { createAuthHandler } from '../../auth-flow';

const auth = createAuthHandler();

export const handler = async (req: HttpRequest) => {
  return auth(req);
};
