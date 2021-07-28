import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Mutation {
    createUserViaMagicLink(email: String!): User!
    resendRegistrationMagicLinkEmail(email: String!): Boolean
  }
`;
