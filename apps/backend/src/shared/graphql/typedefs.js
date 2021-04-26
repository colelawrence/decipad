module.exports = ({ gql }) => gql`
  type User {
    id: String
    name: String
    email: String
    avatar: String
  }
  type Query {
    hello: String
    me: User
  }
`;
