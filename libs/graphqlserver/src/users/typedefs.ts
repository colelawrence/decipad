import { gql } from 'apollo-server-lambda';

export default gql`
  input UserInput {
    name: String
    hideChecklist: Boolean
  }

  type UserAccess {
    user: User!
    permission: PermissionType!
    canComment: Boolean!
  }

  input GoalFulfilmentInput {
    goalName: String!
  }

  extend type Query {
    self: User
    selfFulfilledGoals: [String!]!
  }

  extend type Mutation {
    updateSelf(props: UserInput!): User!
    fulfilGoal(props: GoalFulfilmentInput!): Boolean! ## returns false if already fulfilled
  }
`;
