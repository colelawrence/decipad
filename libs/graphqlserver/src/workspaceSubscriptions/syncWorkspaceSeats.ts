import type { MutationResolvers } from '@decipad/graphqlserver-types';
import {
  findSubscriptionByWorkspaceId,
  updateStripeIfNeeded,
} from './subscription.helpers';
import { getWorkspaceMembersCount } from '../workspaces/workspace.helpers';

export const syncWorkspaceSeats: NonNullable<
  MutationResolvers['syncWorkspaceSeats']
> = async (_, { id: workspaceId }, ctx) => {
  const sub = await findSubscriptionByWorkspaceId(workspaceId);
  const newQuantity = await getWorkspaceMembersCount(workspaceId);

  await updateStripeIfNeeded(ctx.event, sub, newQuantity, workspaceId);
  return sub;
};
