module.exports = ({ gql }) => gql`
  input WorkspaceInput {
    name: String!
  }

  type Workspace {
    id: ID!
    name: String!
    roles: [Role!]!
  }

  extend type Query {
    workspaces: [Workspace!]!
  }

  extend type Mutation {
    createWorkspace(workspace: WorkspaceInput!): Workspace!
    updateWorkspace(id: ID!, workspace: WorkspaceInput!): Workspace!
  }
`;
