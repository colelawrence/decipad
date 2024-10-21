import type { APIGatewayProxyEventV2 } from 'aws-lambda';
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

const { apiKey, apiVersion, webhookSecret } = thirdParty().stripe;

export const stripe = new Stripe(apiKey, {
  apiVersion,
});

export const handler = handle(async (event: APIGatewayProxyEventV2) => {
  if (!event.body) {
    throw Boom.notAcceptable('No Stripe event passed');
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    throw Boom.badRequest('Missing stripe-signature header');
  }

  if (!webhookSecret) {
    throw Boom.internal('Missing webhook secret configuration');
  }

  // eslint-disable-next-line prefer-destructuring
  let body: string | Buffer = event.body;
  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64');
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );

    switch (stripeEvent.type) {
      case 'invoice.created':
        return processInvoiceCreated(stripeEvent);
      case 'checkout.session.completed':
        return processSessionComplete(event, stripeEvent);
      case 'customer.subscription.updated':
        return processSubscriptionUpdated(event, stripeEvent);
      case 'customer.subscription.deleted':
        return processSubscriptionDeleted(event, stripeEvent);
      default:
        throw Boom.teapot(`webhook ignored: ${stripeEvent.type}`);
    }
  } catch (err) {
    console.error(err);
    if (err instanceof stripe.errors.StripeSignatureVerificationError) {
      throw Boom.badRequest('Invalid signature');
    }
    throw err;
  }
});
