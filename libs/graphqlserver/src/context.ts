import { authenticate, AuthResult } from '@decipad/services/authentication';
import { debug } from './debug';
import { GraphqlContext } from '@decipad/graphqlserver-types';

function hasUser(authResult: AuthResult): boolean {
  return !!authResult.user;
}

function hasAnonUser(authResult: AuthResult): boolean {
  return !!authResult.anonUser;
}

export default () =>
  async ({ context }: { context: GraphqlContext }) => {
    const credentials = await authenticate(context.event);
    const userCred = credentials.find(hasUser);
    const anonUserCred = credentials.find(hasAnonUser);
    if (userCred) {
      context.user = userCred.user;
      debug('user', context.user);
    } else if (anonUserCred) {
      context.anonUser = anonUserCred.anonUser;
      debug('anonuser', context.anonUser);
    } else {
      context.user = undefined;
    }

    return context;
  };
