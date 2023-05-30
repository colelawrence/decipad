import { gql } from 'apollo-server-lambda';

export default gql`
  input SecretInput {
    name: String!
    secret: String!
  }

  type Secret {
    id: ID!
    name: String!
    workspace: Workspace
  }

  extend type Query {
    getWorkspaceSecrets(workspaceId: ID!): [Secret!]!
  }

  extend type Mutation {
    createSecret(workspaceId: ID!, secret: SecretInput!): Secret!
    updateSecret(secretId: ID!, secret: String!): Secret!
    removeSecret(secretId: ID!): Boolean!
  }
`;
