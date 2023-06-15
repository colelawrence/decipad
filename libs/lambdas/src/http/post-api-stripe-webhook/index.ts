import { APIGatewayProxyEventV2 } from 'aws-lambda';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Stripe } from 'stripe';
import Boom from '@hapi/boom';
import { thirdParty } from '@decipad/config';
import handle from '../handle';
import { processSessionComplete } from './processStripeEvents';

const stripeConfig = thirdParty().stripe;

export const stripe = new Stripe(stripeConfig.apiKey, {
  apiVersion: '2022-11-15',
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
      case 'checkout.session.completed':
        return processSessionComplete(stripeEvent);
      default:
        // TODO: implement other supported stripe events
        throw Boom.teapot(`webhook ignored: ${stripeEvent.type}`);
    }
  } catch (err: any) {
    throw Boom.forbidden(`Webhook Error: ${err.message}`);
  }
});
