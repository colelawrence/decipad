import { gql } from 'apollo-server-lambda';

export default gql`
  type WorkspaceExecutedQuery {
    id: ID!
    queryCount: Int!
    query_reset_date: DateTime
    quotaLimit: Int!
    workspace: Workspace
  }

  extend type Mutation {
    incrementQueryCount(id: ID!): WorkspaceExecutedQuery!
  }

  extend type Workspace {
    workspaceExecutedQuery: WorkspaceExecutedQuery
  }
`;
