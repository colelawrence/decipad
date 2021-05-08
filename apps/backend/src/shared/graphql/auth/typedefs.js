module.exports = ({ gql }) => gql`
  extend type Mutation {
    pretendUser(userId: ID!): Boolean
  }
`;
