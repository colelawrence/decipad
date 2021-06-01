module.exports = ({ gql }) => gql`
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
