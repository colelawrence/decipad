import { HttpRequest } from '@architect/functions';
import Auth from '../../auth-flow';

const auth = Auth();

export const handler = async (req: HttpRequest) => {
  return auth(req);
};
