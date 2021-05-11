module.exports = ({ gql }) => gql`
  input UserInput {
    name: String
  }

  extend type Query {
    self: User
  }

  extend type Mutation {
    updateSelf(props: UserInput!): User!
  }
`;
