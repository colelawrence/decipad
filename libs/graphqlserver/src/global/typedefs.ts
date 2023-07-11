import { gql } from 'apollo-server-lambda';

export default gql`
  type User {
    id: ID!
    name: String!
    username: String
    description: String
    email: String
    image: String
    createdAt: DateTime
    hideChecklist: Boolean
    onboarded: Boolean
    emailValidatedAt: DateTime
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
    canComment: Boolean!
    createdAt: DateTime
  }

  extend type Query {
    me: User
  }
`;
