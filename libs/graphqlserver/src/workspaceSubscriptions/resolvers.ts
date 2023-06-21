import { GraphqlContext, Workspace } from '@decipad/backendtypes';
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
    syncWorkspaceSeats: async (_: unknown, args: { id: string }) => {
      const workspaceId = args.id;
      const sub = await findSubscriptionByWorkspaceId(workspaceId);
      const newQuantity = await getWorkspaceMembersCount(workspaceId);

      await updateStripeIfNeeded(sub.id, newQuantity);
      return sub;
    },
  },
};
