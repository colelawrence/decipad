module.exports = ({ gql }) => gql`
  type Mutation {
    createUserViaMagicLink(email: String!): User!
    resendRegistrationMagicLinkEmail(email: String!): Boolean
  }
`;
