import { gql } from 'apollo-server-lambda';

export default gql`
  input WorkspaceInput {
    name: String!
  }

  type WorkspaceAccess {
    roles: [RoleAccess!]
    users: [UserAccess!]
  }

  type Workspace {
    id: ID!
    name: String!
    roles: [Role!]!
    pads(page: PageInput!): PagedPadResult!
    sections: [Section!]!
    createdAt: DateTime
    isPublic: Boolean
    isPremium: Boolean
    myPermissionType: PermissionType
    access: WorkspaceAccess
    secrets: [Secret!]!
  }

  type WorkspacesChanges {
    added: [Workspace!]!
    removed: [ID!]!
    updated: [Workspace!]!
  }

  extend type Query {
    getWorkspaceById(id: ID!): Workspace
    workspaces: [Workspace!]!
  }

  extend type Mutation {
    createWorkspace(workspace: WorkspaceInput!): Workspace!
    updateWorkspace(id: ID!, workspace: WorkspaceInput!): Workspace!
    removeWorkspace(id: ID!): Boolean
    shareWorkspaceWithEmail(
      id: ID!
      email: String!
      permissionType: PermissionType!
      canComment: Boolean!
    ): Workspace!
    unshareWorkspaceWithUser(id: ID!, userId: ID!): Workspace
  }

  extend type Subscription {
    workspacesChanged: WorkspacesChanges!
  }
`;
