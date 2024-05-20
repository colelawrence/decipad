/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { track } from '@decipad/backend-analytics';
import { tables } from '@decipad/tables';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { SubscriptionPlansNames } from '@decipad/graphqlserver-types';
import { resourceusage, subscriptions } from '@decipad/services';
import { thirdParty } from '@decipad/backend-config';
import { getDefined } from '@decipad/utils';

const VALID_SUBSCRIPTION_STATES = ['trialing', 'active'];
const { secretKey, apiVersion } = thirdParty().stripe;
const stripe = new Stripe(secretKey, {
  apiVersion,
});

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
  const data = await tables();

  const { subscriptionId, workspaceId } =
    await subscriptions.createWorkspaceSubscription({
      subscription,
      client_reference_id,
      payment_status,
      customer_details,
      metadata,
    });

  const customerList = (
    await stripe.customers.list({ email: getDefined(customer_details?.email) })
  ).data;
  const [firstCustomer] = customerList;

  let userId = firstCustomer?.metadata?.userId;

  // to handle existing users without userId, maybe we can get rid of this in the future
  if (!userId && customer_details?.email) {
    const users = (
      await data.users.query({
        IndexName: 'byEmail',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': customer_details?.email,
        },
      })
    ).Items;

    userId = users[0].id;
  }

  await track(req, {
    event: 'Workspace Upgraded',
    userId,
    properties: {
      subscription_id: subscriptionId,
      workspace_id: workspaceId,
      billing_email: customer_details?.email || '',
      workspace_plan: metadata?.title,
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
  const { id, status, customer } = event.data.object as Stripe.Subscription;
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

    const userId = (
      (await stripe.customers.retrieve(customer.toString())) as Stripe.Customer
    ).metadata?.userId;

    await track(req, {
      event: 'Workspace Plan Cancelled',
      userId,
      properties: {
        cancelation_type: 'cancelled immediately',
        subscription_id: id,
        workspace_id: wsSubscription.workspace_id,
        billing_email: wsSubscription.email,
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
  const { id, status, cancel_at_period_end, customer } = event.data
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

  const userId = (
    (await stripe.customers.retrieve(customer.toString())) as Stripe.Customer
  ).metadata?.userId;

  if (cancel_at_period_end) {
    await track(req, {
      event: 'Workspace Plan Cancelled',
      userId,
      properties: {
        cancelation_type: 'cancelled at the end of the billing cycle',
        subscription_id: wsSubscription.workspace_id,
        workspace_id: workspace.id,
        billing_email: wsSubscription.email,
      },
    });
  }

  await data.workspaces.put({
    ...workspace,
    isPremium,
    plan,
  });

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
      await resourceusage.queries.reset(workspaceSubscription.workspace_id);
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
