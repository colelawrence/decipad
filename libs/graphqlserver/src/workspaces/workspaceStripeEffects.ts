import {
  GraphqlContext,
  WorkspaceRecord,
} from '../../../backendtypes/src/dataTypes';
import subscriptions from '../workspaceSubscriptions/resolvers';

type ResolverFn<TArgs> = (
  parent: unknown,
  args: TArgs,
  context: GraphqlContext
) => Promise<WorkspaceRecord>;

const { syncWorkspaceSeats } = subscriptions.Mutation;

export const withSubscriptionSideEffects = <TArgs>(
  fn: ResolverFn<TArgs>
): ResolverFn<TArgs> => {
  return async (parent, args, context) => {
    const result = await fn(parent, args, context);

    const workspaceId = result.id;
    await syncWorkspaceSeats(parent, { id: workspaceId }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error running syncWorkspaceSeats:', err);
    });

    return result;
  };
};
