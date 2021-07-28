import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Subscription {
    hello: String
  }
`;
