module.exports = ({ gql }) => gql`
  type User {
    id: ID!
    name: String
    email: String
    image: String
    teams: [Team!]!
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
  }

  type Query {
    me: User
  }
`;
