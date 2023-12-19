import { authenticate, AuthResult } from '@decipad/services/authentication';
import { debug } from './debug';
import { GraphqlContext } from '@decipad/graphqlserver-types';

function hasUser(authResult: AuthResult): boolean {
  return !!authResult.user;
}

export default () =>
  async ({ context }: { context: GraphqlContext }) => {
    const credentials = await authenticate(context.event);
    const userCred = credentials.find(hasUser);
    if (userCred) {
      context.user = userCred.user;
      debug('user', context.user);
    } else {
      context.user = undefined;
    }

    return context;
  };
