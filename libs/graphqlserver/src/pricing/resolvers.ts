import { Resolvers } from '@decipad/graphqlserver-types';
import {
  getPlansForCredits,
  getPlansForSubscriptions,
} from './pricing.helpers';

const resolvers: Resolvers = {
  Query: {
    getCreditsPlans: getPlansForCredits,
    getSubscriptionsPlans: getPlansForSubscriptions,
  },
};

export default resolvers;
