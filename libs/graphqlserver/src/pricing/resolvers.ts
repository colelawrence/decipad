import type { Resolvers } from '@decipad/graphqlserver-types';
import {
  getPlansForCredits,
  getPlansForSubscriptions,
  getStripeCheckoutSession,
} from './pricing.helpers';

const resolvers: Resolvers = {
  Query: {
    getCreditsPlans: getPlansForCredits,
    getSubscriptionsPlans: getPlansForSubscriptions,
    getStripeCheckoutSessionInfo: getStripeCheckoutSession,
  },
};

export default resolvers;
