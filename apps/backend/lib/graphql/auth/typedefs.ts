import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Mutation {
    pretendUser(userId: ID!): Boolean
  }
`;
