import { gql } from 'apollo-server-lambda';

export default gql`
  input LogEntry {
    source: String!
    createdAt: DateTime!
    content: String!
  }

  input LogInput {
    resource: String!
    entries: [LogEntry!]!
  }

  extend type Mutation {
    createLogs(input: LogInput!): Boolean
  }
`;
