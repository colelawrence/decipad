import { User } from '@decipad/backendtypes';
import { authenticate, AuthResult } from '@decipad/services/authentication';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

function hasUser(authResult: AuthResult): boolean {
  return !!authResult.user;
}

export default () =>
  async ({
    context,
  }: {
    context: { event: APIGatewayProxyEventV2; user: User | undefined };
  }) => {
    const credentials = await authenticate(context.event);
    const userCred = credentials.find(hasUser);
    if (userCred) {
      context.user = userCred.user;
    } else {
      context.user = undefined;
    }

    return context;
  };
