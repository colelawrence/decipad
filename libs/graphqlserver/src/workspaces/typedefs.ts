import { gql } from 'apollo-server-lambda';

export default gql`
  input WorkspaceInput {
    name: String!
  }

  type Workspace {
    id: ID!
    name: String!
    roles: [Role!]!
    pads(page: PageInput!): PagedPadResult!
    createdAt: DateTime
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
  }

  extend type Subscription {
    workspacesChanged: WorkspacesChanges!
  }
`;
