module.exports = ({ gql }) => gql`
  extend type Subscription {
    hello: String
  }
`;
