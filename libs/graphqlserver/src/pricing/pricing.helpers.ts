import { limits, plans, thirdParty } from '@decipad/backend-config';
import type {
  CheckoutSessionInfo,
  SubscriptionPlan,
} from '@decipad/backendtypes';
import type { QueryResolvers } from '@decipad/graphqlserver-types';
import { getDefined } from '@decipad/utils';
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
        const {
          credits,
          isDefault,
          promotionTag,
          storage,
          queries,
          description,
        } = metadata;
        return {
          id,
          title: metadata.title,
          description,
          // eslint-disable-next-line camelcase
          price: unit_amount ?? 0,
          currency,
          credits: Number(credits),
          isDefault: isDefault === 'true',
          // not used yet
          promotionTag,
          storage: Number(storage),
          queries: Number(queries),
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
        (s) => s.metadata.type === 'plan'
      );

      const allPlans: SubscriptionPlan[] = subscriptionPlans.map((p) => {
        // eslint-disable-next-line camelcase
        const { id, metadata, unit_amount, currency } = p;
        const {
          seats,
          credits,
          queries,
          description,
          storage,
          isDefault,
          key,
          title,
        } = metadata;
        return {
          id,
          currency,
          title,
          key,
          // eslint-disable-next-line camelcase
          price: unit_amount ?? 0,
          seats: Number(seats) || 0,
          credits: Number(credits) || 0,
          queries: Number(queries) || 0,
          description,
          storage: Number(storage) || 0,
          isDefault: isDefault === 'true',
          // field to be deprecated soon
          paymentLink: undefined,
        };
      });

      // small hack to include free plan so we don't have to read env variables in the FE
      allPlans.push({
        id: plans().free,
        key: plans().free,
        credits: limits().maxCredits.free,
        title: plans().freePlanName,
        seats: 1,
        queries: limits().maxQueries.free,
        description:
          'The perfect starting point. All the good data modeling stuff, no fluff.',
      });

      return allPlans;
    } catch (err) {
      throw Boom.badImplementation('Error on Stripe configuration: ', err);
    }
  };

export const getStripeCheckoutSession: QueryResolvers['getStripeCheckoutSessionInfo'] =
  async (_, { priceId, workspaceId }, ctx) => {
    const { email, name } = ctx.user ?? {};
    const priceObject = await stripe.prices.retrieve(priceId);
    let customer: Stripe.Customer;

    if (!priceId) {
      throw Boom.badRequest('priceId cannot be null or undefined');
    }

    if (!priceObject) {
      throw Boom.notFound(
        `Price ${priceId} not found. Please check your config or Stripe dashboard`
      );
    }
    const { metadata } = priceObject;

    const customerListPerEmail = (
      await stripe.customers.list({ email: getDefined(email) })
    ).data;

    // if the customer doesn't exist, we create one
    if (customerListPerEmail.length === 0) {
      // If the logged in user doesn't have an email, then something is wrong
      customer = await stripe.customers.create({
        email: getDefined(email),
        name,
      });
    } else {
      // if there is more than one customer with the same email,
      // we retrieve the most recent one - check https://docs.stripe.com/api/customers/list
      const [firstCustomer] = customerListPerEmail;
      customer = firstCustomer;
    }

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        customer: customer.id,
        redirect_on_completion: 'never',
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        ui_mode: 'embedded',
        metadata,
        client_reference_id: workspaceId,
        allow_promotion_codes: true,
      });

    return {
      id: checkoutSession.id,
      clientSecret: checkoutSession.client_secret,
    } as CheckoutSessionInfo;
  };
