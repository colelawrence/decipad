import tables from '@decipad/tables';
import { Stripe } from 'stripe';
import { limits, plans, thirdParty } from '@decipad/backend-config';
import { ID } from '@decipad/backendtypes';
import { track } from '@decipad/backend-analytics';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  SubscriptionPaymentStatus,
  WorkspaceSubscription,
} from '@decipad/graphqlserver-types';

const { secretKey, apiVersion, subscriptionsProdId } = thirdParty().stripe;
const stripe = new Stripe(secretKey, {
  apiVersion,
});

export const getWorkspaceSubscription = async (
  workspaceId: string
): Promise<WorkspaceSubscription | null> => {
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
    // for now let's return a free subscription dummy
    return {
      id: 'free',
      paymentStatus: 'unpaid',
      paymentLink: '',
      queries: limits().maxCredits.free,
      credits: limits().maxCredits.free,
    };
  }

  // Retroactively populating limits for the current PRO plan - TODO: get rid of this in the future
  const isProPlan =
    (await data.workspaces.get({ id: workspaceId }))?.plan === plans().pro;
  const subsPlans = (
    await stripe.prices.list({
      product: subscriptionsProdId,
      active: true,
      type: 'recurring',
    })
  ).data;

  const proPlan = subsPlans.find((plan) => plan.metadata.isDefault === 'true');

  if (!workspaceSubs.credits && isProPlan) {
    workspaceSubs.credits = Number(proPlan?.metadata.credits) || 0;
  }

  if (!workspaceSubs.queries && isProPlan) {
    workspaceSubs.queries = Number(proPlan?.metadata.queries) || 0;
  }

  // Cast because the _technical_ type is an enum.
  return {
    ...workspaceSubs,
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
    paymentStatus: sub.paymentStatus as SubscriptionPaymentStatus,
  };
};

export const updateStripeIfNeeded = async (
  event: APIGatewayProxyEventV2,
  subs: WorkspaceSubscription,
  newQuantity: number,
  workspaceId: string
) => {
  const data = await tables();
  const subscription = await stripe.subscriptions.retrieve(subs.id);
  const workspace = await data.workspaces.get({ id: workspaceId });
  const workspacePlan = workspace?.plan || 'pro';

  if (subscription.items.data.length === 0) {
    throw new Error('Subscription has no items');
  }
  const planSubsInfo = subscription.items.data.find(
    (item) => item.metadata.type === 'plan'
  );
  const previousQuantity = planSubsInfo?.quantity || 0;

  // if there are no seats, then the current plan is PRO
  if (!subs.seats && workspace?.isPremium) {
    const subscriptionItemID = planSubsInfo?.id || '';

    await stripe.subscriptionItems.update(subscriptionItemID, {
      quantity: newQuantity,
    });
  } else if (subs.seats) {
    if (newQuantity < subs.seats) {
      // nothing to do
      return;
    }

    const pricePerSeatItemResponse = await stripe.prices.search({
      query: `metadata["key"]:"${workspacePlan}" AND metadata["type"]:"seat"`,
    });

    if (pricePerSeatItemResponse.data.length !== 1) {
      throw new Error(
        `Price per seat for plan ${workspacePlan} does not exist or has multiple items`
      );
    }
    const pricePerSeat = pricePerSeatItemResponse.data[0];
    const nrOfAdditionalSeats = newQuantity - subs.seats;
    const subscriptionItemId =
      subscription.items.data.find((si) => si.price.id === pricePerSeat.id)
        ?.id || '';

    await stripe.subscriptionItems.update(subscriptionItemId, {
      quantity: nrOfAdditionalSeats,
    });
  }

  await track(event, {
    event: 'update Stripe subscription seats',
    properties: {
      stripeSubscriptionId: subscription.id,
      previousQuantity: previousQuantity?.toString(),
      newQuantity: newQuantity.toString(),
      workspaceId,
      plan: workspacePlan,
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
