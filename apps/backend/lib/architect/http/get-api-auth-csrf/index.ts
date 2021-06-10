import Auth from '../../../auth-flow';
import { HttpRequest } from '@architect/functions';

const auth = Auth();

export const handler = async (req: HttpRequest) => {
  return await auth(req);
};
