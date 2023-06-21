import tables from '@decipad/tables';
import { Stripe } from 'stripe';
import { thirdParty } from '@decipad/config';
import { resource } from '@decipad/backend-resources';
import {
  GraphqlContext,
  WorkspaceSubscriptionRecord,
} from '@decipad/backendtypes';

const stripeConfig = thirdParty().stripe;
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2022-11-15',
});

const workspacesResource = resource('workspace');

export const getWorkspaceSubscription = async (
  workspaceId: string,
  context: GraphqlContext
): Promise<WorkspaceSubscriptionRecord | undefined> => {
  await workspacesResource.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const data = await tables();
  return (
    await data.workspacesubscriptions.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items[0];
};

export const findSubscriptionByWorkspaceId = async (workspaceId: string) => {
  const data = await tables();

  const workspaces = await data.workspacesubscriptions.query({
    IndexName: 'byWorkspace',
    KeyConditionExpression: 'workspace_id = :workspace_id',
    ExpressionAttributeValues: {
      ':workspace_id': workspaceId,
    },
  });

  if (workspaces.Count === 0) {
    throw new Error('Workspace not found');
  }

  return workspaces.Items[0];
};

export const updateStripeIfNeeded = async (
  subscriptionId: string,
  newQuantity: number
) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (subscription.items.data.length === 0) {
    throw new Error('Subscription has no items');
  }

  const subscriptionItemID = subscription.items.data[0].id;
  const previousQuantity = subscription.items.data[0].quantity;

  if (newQuantity === previousQuantity) {
    return;
  }

  await stripe.subscriptionItems.update(subscriptionItemID, {
    quantity: newQuantity,
  });
};
