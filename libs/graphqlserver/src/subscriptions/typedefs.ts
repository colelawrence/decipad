import { gql } from 'apollo-server-lambda';

export default gql`
  enum SubscriptionStatus {
    active
    inactive
  }

  enum SubscriptionPaymentStatus {
    paid
    delayed
  }

  type Subscription {
    id: String
    status: SubscriptionStatus
    paymentStatus: SubscriptionPaymentStatus
    workspace: Workspace
  }
`;
