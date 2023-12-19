import tables from '@decipad/tables';
import { Stripe } from 'stripe';
import { thirdParty } from '@decipad/backend-config';
import { resource } from '@decipad/backend-resources';
import { GraphqlContext, ID } from '@decipad/backendtypes';
import { track } from '@decipad/backend-analytics';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  SubscriptionPaymentStatus,
  WorkspaceSubscription,
} from '@decipad/graphqlserver-types';
import { getDefined } from '@decipad/utils';

const stripeConfig = thirdParty().stripe;
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2023-08-16',
});

const workspacesResource = resource('workspace');

export const getWorkspaceSubscription = async (
  workspaceId: string,
  context: GraphqlContext
): Promise<WorkspaceSubscription | null> => {
  await workspacesResource.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const data = await tables();
  const workspaceSubs = (
    await data.workspacesubscriptions.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items[0];

  if (workspaceSubs == null) {
    return null;
  }

  // Cast because the _technical_ type is an enum.
  return {
    ...workspaceSubs,
    customer_id: workspaceSubs.customer_id,
    paymentStatus: workspaceSubs.paymentStatus as SubscriptionPaymentStatus,
  };
};

export const findSubscriptionByWorkspaceId = async (
  workspaceId: string
): Promise<WorkspaceSubscription> => {
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

  const sub = workspaces.Items[0];

  // Cast because the _technical_ type is an enum.
  return {
    ...sub,
    customer_id: getDefined(sub.customer_id),
    paymentStatus: sub.paymentStatus as SubscriptionPaymentStatus,
  };
};

export const updateStripeIfNeeded = async (
  event: APIGatewayProxyEventV2,
  subs: WorkspaceSubscription,
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

  await track(event, {
    event: 'update Stripe subscription seats',
    properties: {
      stripeSubscriptionId: subscription.id,
      previousQuantity: previousQuantity?.toString(),
      newQuantity: newQuantity.toString(),
      // TODO
      // billingEmail: subs.email,
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

export const cancelSubscriptionFromWorkspaceId = async (
  event: APIGatewayProxyEventV2,
  workspaceId: ID
) => {
  const subscription = await findSubscriptionByWorkspaceId(workspaceId);

  if (!subscription) {
    throw new Error('Stripe Subscription does not exist');
  }

  await track(event, {
    event: 'Stripe subscription deleted',
    properties: {
      id: subscription.id,
      workspaceId: subscription.id,
      // TODO
      // billingEmail: subscription.email,
    },
  });

  await cancelStripeSubscription(subscription.id);
};
