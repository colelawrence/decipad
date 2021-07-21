import { gql } from 'apollo-server-lambda';

export default gql`
  input PadInput {
    name: String
    tags: [String!]
  }

  type RoleAccess {
    role: Role!
    permission: PermissionType!
    canComment: Boolean!
  }

  type UserAccess {
    user: User!
    permission: PermissionType!
    canComment: Boolean!
  }

  type PadAccess {
    roles: [RoleAccess!]!
    users: [UserAccess!]!
  }

  type Pad {
    id: ID!
    name: String!
    access: PadAccess!
    workspace: Workspace!
    createdAt: DateTime
  }

  type PagedPadResult {
    items: [Pad!]!
    count: Int!
    hasNextPage: Boolean!
    cursor: String
  }

  type PadChanges {
    added: [Pad!]!
    removed: [ID!]!
    updated: [Pad!]!
  }

  extend type Query {
    getPadById(id: ID!): Pad
    pads(workspaceId: ID!, page: PageInput!): PagedPadResult!
  }

  extend type Mutation {
    createPad(workspaceId: ID!, pad: PadInput!): Pad!

    updatePad(id: ID!, pad: PadInput!): Pad!

    removePad(id: ID!): Boolean

    duplicatePad(id: ID!): Pad!

    sharePadWithRole(
      padId: ID!
      roleId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    unsharePadWithRole(padId: ID!, roleId: ID!): Boolean

    sharePadWithUser(
      padId: ID!
      userId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    unsharePadWithUser(padId: ID!, userId: ID!): Boolean

    sharePadWithEmail(
      padId: ID!
      email: String
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean
  }

  extend type Subscription {
    padsChanged(workspaceId: ID!): PadChanges!
  }
`;
