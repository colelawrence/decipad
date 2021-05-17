module.exports = ({ gql }) => gql`
  type User {
    id: ID!
    name: String
    email: String
    image: String
  }

  enum PermissionType {
    READ
    WRITE
    ADMIN
  }

  type Permission {
    id: ID!
    resource: String!
    user: User!
    type: PermissionType!
    givenBy: User!
  }

  type Query {
    me: User
  }
`;
