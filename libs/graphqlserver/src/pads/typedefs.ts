import { gql } from 'apollo-server-lambda';

export default gql`
  input PadInput {
    name: String
    icon: String
    status: String
    archived: Boolean
    section_id: String
    tags: [String!]
    isTemplate: Boolean
  }

  type SecretAccess {
    secret: String!
    permission: PermissionType!
    canComment: Boolean!
  }
  type PadAccess {
    id: ID!
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
    section: Section
    padConnectionParams: PadConnectionParams!
    initialState: String
    snapshots: [PadSnapshot!]!
    document: String!
    isTemplate: Boolean
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
    padsSharedWithMe(page: PageInput!): PagedPadResult!
    featuredPad: Pad
    searchTemplates(query: String!, page: PageInput!): PagedPadResult!
  }

  extend type Mutation {
    createPad(workspaceId: ID!, pad: PadInput!, sectionId: ID): Pad!
    updatePad(id: ID!, pad: PadInput!): Pad!
    removePad(id: ID!): Boolean
    duplicatePad(id: ID!, targetWorkspace: ID!, document: String): Pad!
    importPad(workspaceId: ID!, source: String!): Pad!
    movePad(id: ID!, workspaceId: ID!): Pad!

    setPadPublic(id: ID!, isPublic: Boolean!): Boolean!

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
    ): Pad

    unsharePadWithUser(id: ID!, userId: ID!): Pad

    sharePadWithEmail(
      id: ID!
      email: String!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Pad!

    sharePadWithSecret(
      id: ID!
      permissionType: PermissionType!
      canComment: Boolean!
    ): String!

    unshareNotebookWithSecret(id: ID!, secret: String!): Boolean

    createOrUpdateSnapshot(
      notebookId: ID!
      snapshotName: String!
      forceSearchIndexUpdate: Boolean
    ): Boolean!
  }

  extend type Subscription {
    padsChanged(workspaceId: ID!): PadChanges!
  }

  extend type Section {
    pads: [Pad!]!
  }
`;
