const { gql } = require('apollo-server-lambda');

module.exports = gql`
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