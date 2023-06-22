/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { tables } from 'libs/tables/src/tables';

const VALID_SUBSCRIPTION_STATES = ['trialing', 'active'];

export const processSessionComplete = async (event: Stripe.Event) => {
  const {
    client_reference_id,
    payment_link,
    payment_status,
    customer_details,
    subscription,
  } = event.data.object as Stripe.Checkout.Session;
  const data = await tables();
  const paymentLink =
    typeof payment_link === 'string' ? payment_link : payment_link?.id || '';
  const subscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id || '';

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
  });

  return {
    statusCode: 200,
    body: `webhook succeeded: ${client_reference_id}`,
  };
};

export const processSubscriptionDeleted = async (event: Stripe.Event) => {
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
    });
  }

  return {
    statusCode: 200,
    body: `webhook succeeded! Subscription deleted: ${id}`,
  };
};

export const processSubscriptionUpdated = async (event: Stripe.Event) => {
  const { id, status } = event.data.object as Stripe.Subscription;
  const data = await tables();
  let isPremium = false;

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
  }
  await data.workspaces.put({
    ...workspace,
    isPremium,
  });

  return {
    statusCode: 200,
    body: `webhook succeeded! Subscription updated: ${id}`,
  };
};
