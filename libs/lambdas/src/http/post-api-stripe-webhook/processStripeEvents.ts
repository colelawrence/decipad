/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { track } from '@decipad/backend-analytics';
import { tables } from '@decipad/tables';
import { limits } from '@decipad/backend-config';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import { z } from 'zod';
import { resourceusage } from '@decipad/services';

const VALID_SUBSCRIPTION_STATES = ['trialing', 'active'];

const updateQueryExecutionTable = async (
  workspaceId: string,
  plan: SubscriptionPlansNames
) => {
  const data = await tables();
  const queryExecutionRecord = await data.workspacexecutedqueries.get({
    id: workspaceId,
  });

  const limitsPerPlan = limits().maxCredits[plan === 'free' ? 'free' : 'pro'];

  if (queryExecutionRecord) {
    await data.workspacexecutedqueries.put({
      ...queryExecutionRecord,
      quotaLimit: limitsPerPlan ?? limits().maxCredits.free,
    });
  }
};

const validatePlanName = z.union([
  z.literal<SubscriptionPlansNames>('free'),
  z.literal<SubscriptionPlansNames>('personal'),
  z.literal<SubscriptionPlansNames>('team'),
  z.literal<SubscriptionPlansNames>('enterprise'),

  // Legacy plans.
  z.literal('pro'),
]);

export const processSessionComplete = async (
  req: APIGatewayProxyEventV2,
  event: Stripe.Event
) => {
  const {
    client_reference_id,
    payment_link,
    payment_status,
    customer_details,
    subscription,
    metadata,
  } = event.data.object as Stripe.Checkout.Session;

  const data = await tables();
  let plan: z.infer<typeof validatePlanName> = 'free';

  const parsedKey = validatePlanName.safeParse(metadata?.key);
  if (!parsedKey.success) {
    throw Boom.badRequest(
      'Stripe plan does not match enum. VERY SERIOUS. ASK MARTA OR JOHN'
    );
  }

  const stripePlan = parsedKey.data;

  if (payment_status === 'paid') {
    plan = stripePlan ?? 'pro';
  }

  const paymentLink =
    typeof payment_link === 'string' ? payment_link : payment_link?.id || '';
  const subscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id ?? '';
  const credits = Number(metadata?.credits) || 0;
  const seats = Number(metadata?.seats) || 0;
  const storage = Number(metadata?.storage) || 0;
  const queries = Number(metadata?.queries) || 0;

  if (!client_reference_id) {
    throw Boom.badRequest('Webhook Error: invalid client reference');
  }

  if (!subscriptionId) {
    throw Boom.badRequest('Webhook Error: subscription does not exist');
  }

  const workspace = await data.workspaces.get({ id: client_reference_id });

  if (!workspace) {
    throw Boom.badRequest('Webhook Error: workspace does not exist');
  }

  const wsSubscription = await data.workspacesubscriptions.get({
    id: subscriptionId,
  });

  if (wsSubscription) {
    throw Boom.conflict('Webhook error: subscription already exists');
  }

  // update Stripe subscription
  await data.workspacesubscriptions.put({
    id: subscriptionId,
    workspace_id: workspace.id,
    clientReferenceId: client_reference_id,
    paymentLink,
    paymentStatus: payment_status,
    email: customer_details?.email || '',
    credits,
    queries,
    seats,
    storage,
  });

  await data.workspaces.put({
    ...workspace,
    isPremium: payment_status === 'paid',
    plan,
  });
  updateQueryExecutionTable(workspace.id, plan);

  await track(req, {
    event: 'Stripe subscription created',
    properties: {
      id: subscriptionId,
      workspaceId: workspace.id,
      billingEmail: customer_details?.email || '',
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
    updateQueryExecutionTable(workspace.id, 'free');

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
  updateQueryExecutionTable(workspace.id, plan);

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
      await resourceusage.resetAiUsage(workspaceSubscription.workspace_id);

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
