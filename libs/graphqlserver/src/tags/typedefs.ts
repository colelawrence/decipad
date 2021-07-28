import { gql } from 'apollo-server-lambda';

export default gql`
  type TagRecord {
    tag: String!
    workspaceId: ID!
  }

  type TagChanges {
    added: [TagRecord!]!
    removed: [TagRecord!]!
  }

  extend type Query {
    tags(workspaceId: ID!): [String!]!
    padsByTag(workspaceId: ID!, tag: String!, page: PageInput!): PagedPadResult!
  }

  extend type Mutation {
    addTagToPad(padId: ID!, tag: String!): Boolean
    removeTagFromPad(padId: ID!, tag: String!): Boolean
  }

  extend type Pad {
    tags: [String!]!
  }

  extend type Subscription {
    tagsChanged(workspaceId: ID!): TagChanges!
  }
`;
