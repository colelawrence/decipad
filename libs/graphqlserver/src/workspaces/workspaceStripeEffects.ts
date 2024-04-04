/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  GraphqlContext,
  WorkspaceRecord,
} from '../../../backendtypes/src/dataTypes';
import { syncWorkspaceSeats } from '../workspaceSubscriptions/syncWorkspaceSeats';

type ResolverFn<TArgs> = (
  parent: unknown,
  args: TArgs,
  context: GraphqlContext
) => Promise<WorkspaceRecord>;

export const withSubscriptionSideEffects = <TArgs>(
  fn: ResolverFn<TArgs>
): ResolverFn<TArgs> => {
  return async (parent, args, context) => {
    const result = await fn(parent, args, context);

    const workspaceId = result.id;

    if (typeof syncWorkspaceSeats !== 'function') {
      // Should never reach.
      throw new Error('syncWorkspaceSeats not a function');
    }

    try {
      await syncWorkspaceSeats(
        parent as any,
        { id: workspaceId },
        context,
        {} as any
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error running syncWorkspaceSeats:', err);
    }

    return result;
  };
};
