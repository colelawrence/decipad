import { gql } from 'apollo-server-lambda';

export default gql`
  type Query {
    version: String
  }

  type Mutation {
    doNothing: Boolean
  }

  type Subscription {
    subscribeToNothing: Boolean
  }
`;
