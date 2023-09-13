import { APIGatewayProxyEventV2 } from 'aws-lambda';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/backend-config';
import handle from '../handle';
import {
  processSessionComplete,
  processSubscriptionUpdated,
  processSubscriptionDeleted,
  processInvoiceCreated,
} from './processStripeEvents';

const stripeConfig = thirdParty().stripe;

export const stripe = new Stripe(stripeConfig.apiKey, {
  apiVersion: '2023-08-16',
});

export const handler = handle(async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    throw Boom.notAcceptable('No Stripe event passed');
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig || '',
      stripeConfig.webhookSecret || ''
    );

    switch (stripeEvent.type) {
      case 'invoice.created':
        return processInvoiceCreated(stripeEvent);
      case 'checkout.session.completed':
        return processSessionComplete(stripeEvent);
      case 'customer.subscription.updated':
        return processSubscriptionUpdated(stripeEvent);
      case 'customer.subscription.deleted':
        return processSubscriptionDeleted(stripeEvent);
      default:
        throw Boom.teapot(`webhook ignored: ${stripeEvent.type}`);
    }
  } catch (err: any) {
    throw Boom.forbidden(`Webhook Error: ${err.message}`);
  }
});
