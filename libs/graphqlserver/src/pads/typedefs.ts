import { gql } from 'apollo-server-lambda';

export default gql`
  input PadInput {
    name: String
    tags: [String!]
  }

  type SecretAccess {
    secret: String!
    permission: PermissionType!
    canComment: Boolean!
  }
  type PadAccess {
    roles: [RoleAccess!]!
    users: [UserAccess!]!
    secrets: [SecretAccess!]!
  }

  type Pad {
    id: ID!
    name: String!
    access: PadAccess!
    myPermissionType: PermissionType!
    workspace: Workspace!
    createdAt: DateTime
    isPublic: Boolean
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
    duplicatePad(id: ID!, targetWorkspace: ID): Pad!
    importPad(workspaceId: ID!, source: String!): Pad!

    setPadPublic(id: ID!, isPublic: Boolean!): Pad!

    sharePadWithRole(
      id: ID!
      roleId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    unsharePadWithRole(id: ID!, roleId: ID!): Boolean

    sharePadWithUser(
      id: ID!
      userId: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    unsharePadWithUser(id: ID!, userId: ID!): Boolean

    sharePadWithEmail(
      id: ID!
      email: String!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Boolean

    sharePadWithSecret(
      id: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): String!

    unshareNotebookWithSecret(id: ID!, secret: String!): Boolean
  }

  extend type Subscription {
    padsChanged(workspaceId: ID!): PadChanges!
  }
`;
