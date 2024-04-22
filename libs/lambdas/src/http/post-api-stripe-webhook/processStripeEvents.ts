/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import type { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { track } from '@decipad/backend-analytics';
import { tables } from '@decipad/tables';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import { resourceusage, subscriptions } from '@decipad/services';
import { limits } from '@decipad/backend-config';

const VALID_SUBSCRIPTION_STATES = ['trialing', 'active'];

export const processSessionComplete = async (
  req: APIGatewayProxyEventV2,
  event: Stripe.Event
) => {
  const {
    client_reference_id,
    payment_status,
    customer_details,
    subscription,
    metadata,
  } = event.data.object as Stripe.Checkout.Session;

  const { subscriptionId, workspaceId } =
    await subscriptions.createWorkspaceSubscription({
      subscription,
      client_reference_id,
      payment_status,
      customer_details,
      metadata,
    });

  await track(req, {
    event: 'Stripe subscription created',
    properties: {
      id: subscriptionId,
      workspaceId,
      billingEmail: customer_details?.email || '',
      plan: metadata?.title,
    },
  });

  return {
    statusCode: 200,
    body: `webhook succeeded: ${client_reference_id}`,
  };
};

export const processSubscriptionDeleted = async (
  req: APIGatewayProxyEventV2,
  event: Stripe.Event
) => {
  const { id, status } = event.data.object as Stripe.Subscription;
  const data = await tables();

  const wsSubscription = await data.workspacesubscriptions.get({
    id,
  });

  if (!wsSubscription) {
    throw Boom.badRequest(`Subscription des not exist: ${id}`);
  }

  const workspace = await data.workspaces.get({
    id: wsSubscription.workspace_id,
  });

  if (!workspace) {
    throw Boom.badRequest(`Workspace does not exist: ${id}`);
  }

  if (status === 'canceled') {
    await data.workspacesubscriptions.delete({ id });

    await data.workspaces.put({
      ...workspace,
      isPremium: false,
      plan: 'free',
    });
    subscriptions.updateQueryExecutionTable(
      workspace.id,
      limits().maxQueries.free
    );

    await track(req, {
      event: 'Stripe subscription immediately cancelled',
      properties: {
        id,
        workspaceId: wsSubscription.workspace_id,
        billingEmail: wsSubscription.email,
      },
    });
  }

  return {
    statusCode: 200,
    body: `webhook succeeded! Subscription deleted: ${id}`,
  };
};

export const processSubscriptionUpdated = async (
  req: APIGatewayProxyEventV2,
  event: Stripe.Event
) => {
  const { id, status, cancel_at_period_end } = event.data
    .object as Stripe.Subscription;
  const data = await tables();
  let isPremium = false;
  let plan: SubscriptionPlansNames = 'free';

  const wsSubscription = await data.workspacesubscriptions.get({
    id,
  });

  if (!wsSubscription) {
    throw Boom.badRequest(`Subscription des not exist: ${id}`);
  }

  const workspace = await data.workspaces.get({
    id: wsSubscription.workspace_id,
  });

  if (!workspace) {
    throw Boom.badRequest(
      `Workspace des not exist: ${wsSubscription.workspace_id}`
    );
  }

  if (VALID_SUBSCRIPTION_STATES.includes(status)) {
    isPremium = true;
    plan = workspace.plan ?? 'pro';
  }

  if (cancel_at_period_end) {
    await track(req, {
      event: 'Stripe subscription to be cancelled at period end',
      properties: {
        id: wsSubscription.workspace_id,
        workspaceId: workspace.id,
        billingEmail: wsSubscription.email,
      },
    });
  }

  await data.workspaces.put({
    ...workspace,
    isPremium,
    plan,
  });
  subscriptions.updateQueryExecutionTable(
    workspace.id,
    wsSubscription.queries ?? limits().maxQueries.pro
  );

  return {
    statusCode: 200,
    body: `webhook succeeded! Subscription updated: ${id}`,
  };
};

/**
 * Called when Stripe creates an invoice (which means the user has payed their subscription).
 *
 * Handle any resets here.
 */
export const processInvoiceCreated = async (event: Stripe.Event) => {
  const { subscription } = event.data.object as Stripe.Invoice;
  const data = await tables();
  const stripeSubscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id;

  if (stripeSubscriptionId) {
    const workspaceSubscription = await data.workspacesubscriptions.get({
      id: stripeSubscriptionId,
    });

    if (workspaceSubscription) {
      await resourceusage.resetQueryCount(workspaceSubscription.workspace_id);
      await resourceusage.ai.reset(workspaceSubscription.workspace_id);

      return {
        statusCode: 200,
        body: `webhook succeeded! Workspace query count reset: ${workspaceSubscription.workspace_id}`,
      };
    }

    return {
      statusCode: 200,
      body: `webhook succeeded! Workspace does not have any query count to reset.  Stripe Subscription ${stripeSubscriptionId}`,
    };
  }

  return {
    statusCode: 400,
    body: `webhook failed! Workspace query count not reset. Stripe Subscription ${stripeSubscriptionId} does not exist in the database`,
  };
};
