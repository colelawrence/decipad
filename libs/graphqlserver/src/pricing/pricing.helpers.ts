import { limits, plans, thirdParty } from '@decipad/backend-config';
import { SubscriptionPlan } from '@decipad/backendtypes';
import { QueryResolvers } from '@decipad/graphqlserver-types';
import Boom from '@hapi/boom';
import Stripe from 'stripe';

const { secretKey, apiVersion, extraCreditsProdId, subscriptionsProdId } =
  thirdParty().stripe;
const stripe = new Stripe(secretKey, {
  apiVersion,
});

export const getPlansForCredits: QueryResolvers['getCreditsPlans'] =
  async () => {
    try {
      const product = await stripe.products.retrieve(extraCreditsProdId);

      const creditsPlans = await stripe.prices.list({
        product: extraCreditsProdId,
      });

      const filteredPlans = creditsPlans.data.map((p) => {
        // eslint-disable-next-line camelcase
        const { id, metadata, unit_amount, currency } = p;
        return {
          id,
          title: metadata.title,
          description: metadata.description,
          // eslint-disable-next-line camelcase
          price: unit_amount ?? 0,
          currency,
          credits: Number(metadata.credits),
          isDefault: metadata.isDefault === 'true',
          // not used yet
          promotionTag: metadata.promotionTag,
        };
      });

      const { metadata, id } = product;
      return {
        id,
        title: metadata.title,
        plans: filteredPlans,
      };
    } catch (err) {
      throw Boom.badImplementation('Error on Stripe configuration: ', err);
    }
  };

export const getPlansForSubscriptions: QueryResolvers['getSubscriptionsPlans'] =
  async () => {
    try {
      const subscriptionPlansAndData = await stripe.prices.list({
        product: subscriptionsProdId,
        active: true,
      });

      const subscriptionPlans = (subscriptionPlansAndData.data || []).filter(
        (s) => s.type === 'recurring'
      );

      const pricesPerSeat = (subscriptionPlansAndData.data || []).filter(
        (s) => s.type === 'one_time'
      );

      const allPlans: SubscriptionPlan[] = subscriptionPlans.map((p) => {
        // eslint-disable-next-line camelcase
        const { id, metadata, unit_amount, currency } = p;

        return {
          id,
          currency,
          title: metadata.title,
          key: metadata.key,
          paymentLink: metadata.paymentLink,
          // eslint-disable-next-line camelcase
          price: unit_amount ?? 0,
          seats: Number(metadata.seats) || 0,
          credits: Number(metadata.credits) || 0,
          queries: Number(metadata.queries) || 0,
          description: metadata.description,
          storage: Number(metadata.storage) || 0,
          isDefault: metadata.isDefault === 'true',
          pricePerSeat:
            pricesPerSeat.find((price) => price.metadata?.key === metadata.key)
              ?.unit_amount ?? 0,
        };
      });

      // small hack to include free plan so we don't have to read env variables in the FE
      allPlans.push({
        id: plans().free,
        key: plans().free,
        credits: limits().maxCredits.free,
        title: plans().freePlanName,
        seats: 1,
        queries: limits().maxCredits.free,
      });

      return allPlans;
    } catch (err) {
      throw Boom.badImplementation('Error on Stripe configuration: ', err);
    }
  };
