import { gql } from 'apollo-server-lambda';

export default gql`
  input UserInput {
    name: String
  }

  type UserAccess {
    user: User!
    permission: PermissionType!
    canComment: Boolean!
  }

  extend type Query {
    self: User
  }

  extend type Mutation {
    updateSelf(props: UserInput!): User!
  }
`;
