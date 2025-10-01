import { limits, plans } from '@decipad/backend-config';
import type { SubscriptionPlan } from '@decipad/backendtypes';
import type { QueryResolvers } from '@decipad/graphqlserver-types';
import Boom from '@hapi/boom';

export const getPlansForCredits: QueryResolvers['getCreditsPlans'] =
  async () => {
    // Return empty credits plan since Stripe is removed
    return {
      id: 'credits-disabled',
      title: 'Credits Disabled',
      plans: [],
    };
  };

export const getPlansForSubscriptions: QueryResolvers['getSubscriptionsPlans'] =
  async () => {
    // Return only the free plan since Stripe is removed
    const allPlans: SubscriptionPlan[] = [
      {
        id: plans().free,
        key: plans().free,
        credits: limits().maxCredits.free,
        title: plans().freePlanName,
        seats: 1,
        queries: limits().maxQueries.free,
        storage: limits().storage.free,
        description:
          'The perfect starting point. All our unique modeling features, free forever.',
        price: 0,
        currency: 'usd',
        isDefault: true,
        paymentLink: undefined,
      },
    ];

    return allPlans;
  };

export const getStripeCheckoutSession: QueryResolvers['getStripeCheckoutSessionInfo'] =
  async () => {
    // Stripe is disabled, return error
    throw Boom.badRequest('Payment processing is currently disabled');
  };
