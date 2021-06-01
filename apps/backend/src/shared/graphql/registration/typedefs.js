module.exports = ({ gql }) => gql`
  extend type Mutation {
    createUserViaMagicLink(email: String!): User!
    resendRegistrationMagicLinkEmail(email: String!): Boolean
  }
`;
