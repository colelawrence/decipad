import { User } from '@decipad/backendtypes';
import { authenticate } from '@decipad/services/authentication';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export default () =>
  async ({
    context,
  }: {
    context: { event: APIGatewayProxyEventV2; user: User | null };
  }) => {
    const { user } = await authenticate(context.event);
    context.user = user;
    return context;
  };
