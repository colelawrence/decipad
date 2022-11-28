import { gql } from 'apollo-server-lambda';

export default gql`
  input PadInput {
    name: String
    icon: String
    status: String
    archived: Boolean
    tags: [String!]
  }

  type SecretAccess {
    secret: String!
    permission: PermissionType!
    canComment: Boolean!
  }
  type PadAccess {
    roles: [RoleAccess!]
    users: [UserAccess!]
    secrets: [SecretAccess!]
  }

  type PadConnectionParams {
    url: String!
    token: String!
  }

  type Pad {
    id: ID!
    name: String!
    access: PadAccess!
    myPermissionType: PermissionType
    workspace: Workspace
    createdAt: DateTime
    isPublic: Boolean
    icon: String
    status: String
    archived: Boolean
    padConnectionParams: PadConnectionParams!
    initialState: String
    snapshots: [PadSnapshot!]!
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

  type PadSnapshot {
    snapshotName: String!
    createdAt: DateTime
    updatedAt: DateTime
    data: String
    version: String
  }

  extend type Query {
    getPadById(id: ID!, snapshotName: String): Pad
    pads(workspaceId: ID!, page: PageInput!): PagedPadResult!
  }

  extend type Mutation {
    createPad(workspaceId: ID!, pad: PadInput!): Pad!
    updatePad(id: ID!, pad: PadInput!): Pad!
    removePad(id: ID!): Boolean
    duplicatePad(id: ID!, targetWorkspace: ID!, document: String): Pad!
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

    createOrUpdateSnapshot(notebookId: ID!, snapshotName: String!): Pad!
  }

  extend type Subscription {
    padsChanged(workspaceId: ID!): PadChanges!
  }
`;
