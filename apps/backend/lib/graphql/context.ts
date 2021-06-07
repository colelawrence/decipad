import auth from '../auth';

export default () => async ({ context }: { context: any }) => {
  const { user } = await auth(context.event);
  context.user = user;
  return context;
};

