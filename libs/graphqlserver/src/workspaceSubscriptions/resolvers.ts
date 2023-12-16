import type {
  GraphqlContext,
  Workspace,
  WorkspaceSubscriptionRecord,
} from '@decipad/backendtypes';
import {
  findSubscriptionByWorkspaceId,
  getWorkspaceSubscription,
  updateStripeIfNeeded,
} from './subscription.helpers';
import { getWorkspaceMembersCount } from '../workspaces/workspace.helpers';

export default {
  Workspace: {
    async workspaceSubscription(
      workspace: Workspace,
      _: unknown,
      context: GraphqlContext
    ) {
      return getWorkspaceSubscription(workspace.id, context);
    },
  },

  Mutation: {
    syncWorkspaceSeats: async (
      _: unknown,
      args: { id: string },
      ctx: GraphqlContext
    ) => {
      const workspaceId = args.id;
      const sub: WorkspaceSubscriptionRecord =
        await findSubscriptionByWorkspaceId(workspaceId);
      const newQuantity = await getWorkspaceMembersCount(workspaceId);

      await updateStripeIfNeeded(ctx.event, sub, newQuantity);
      return sub;
    },
  },
};
