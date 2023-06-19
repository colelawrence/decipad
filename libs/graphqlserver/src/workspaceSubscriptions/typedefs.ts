import { gql } from 'apollo-server-lambda';

export default gql`
  enum SubscriptionStatus {
    active
    canceled
    unpaid
  }

  enum SubscriptionPaymentStatus {
    paid
    unpaid
  }

  type WorkspaceSubscription {
    id: String
    status: SubscriptionStatus
    paymentStatus: SubscriptionPaymentStatus
    paymentLink: String
    workspace: Workspace
  }

  extend type Workspace {
    workspaceSubscription: WorkspaceSubscription
  }
`;
