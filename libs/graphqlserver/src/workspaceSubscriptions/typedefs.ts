import { gql } from 'apollo-server-lambda';

export default gql`
  enum SubscriptionStatus {
    active
    canceled
    unpaid
    trialing
    incomplete
    incomplete_expired
    past_due
    paused
  }

  enum SubscriptionPaymentStatus {
    paid
    unpaid
    no_payment_required
  }

  type WorkspaceSubscription {
    id: String
    customer_id: String
    status: SubscriptionStatus
    paymentStatus: SubscriptionPaymentStatus
    paymentLink: String
    workspace: Workspace
    seats: Int
  }

  extend type Mutation {
    syncWorkspaceSeats(id: ID!): WorkspaceSubscription!
  }

  extend type Workspace {
    workspaceSubscription: WorkspaceSubscription
  }
`;
