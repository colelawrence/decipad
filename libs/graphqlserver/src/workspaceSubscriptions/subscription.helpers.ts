import tables from '@decipad/tables';
import { Stripe } from 'stripe';
import { thirdParty } from '@decipad/backend-config';
import { resource } from '@decipad/backend-resources';
import {
  GraphqlContext,
  ID,
  WorkspaceSubscriptionRecord,
} from '@decipad/backendtypes';
import { track } from '@decipad/backend-analytics';

const stripeConfig = thirdParty().stripe;
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2023-08-16',
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
  subs: WorkspaceSubscriptionRecord,
  newQuantity: number
) => {
  const subscription = await stripe.subscriptions.retrieve(subs.id);

  if (subscription.items.data.length === 0) {
    throw new Error('Subscription has no items');
  }

  const subscriptionItemID = subscription.items.data[0].id;
  const previousQuantity = subscription.items.data[0].quantity;

  await stripe.subscriptionItems.update(subscriptionItemID, {
    quantity: newQuantity,
  });

  await track({
    event: 'update Stripe subscription seats',
    properties: {
      stripeSubscriptionId: subscription.id,
      previousQuantity: previousQuantity?.toString(),
      newQuantity: newQuantity.toString(),
      billingEmail: subs.email,
    },
  });
};

export const cancelStripeSubscription = async (subscriptionId: ID) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription) {
    throw new Error('Stripe Subscription does not exist');
  }

  await stripe.subscriptions.cancel(subscriptionId);
};

export const cancelSubscriptionFromWorkspaceId = async (workspaceId: ID) => {
  const subscription = await findSubscriptionByWorkspaceId(workspaceId);

  if (!subscription) {
    throw new Error('Stripe Subscription does not exist');
  }

  await track({
    event: 'Stripe subscription deleted',
    properties: {
      id: subscription.id,
      workspaceId: subscription.workspace_id,
      billingEmail: subscription.email,
    },
  });

  await cancelStripeSubscription(subscription.id);
};
