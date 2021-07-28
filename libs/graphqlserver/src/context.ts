import { authenticate } from '@decipad/services/authentication';

export default () =>
  async ({ context }: { context: any }) => {
    const { user } = await authenticate(context.event);
    context.user = user;
    return context;
  };
