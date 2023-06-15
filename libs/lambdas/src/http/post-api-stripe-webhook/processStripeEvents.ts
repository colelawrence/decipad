/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { tables } from 'libs/tables/src/tables';

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
    workspace_id: workspace?.id || '',
    client_reference_id,
    payment_link: paymentLink,
    payment_status,
    email: customer_details?.email || '',
  });

  return {
    statusCode: 200,
    body: `webhook succeeded: ${client_reference_id}`,
  };
};
