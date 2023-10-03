import { gql } from 'apollo-server-lambda';

export default gql`
  scalar GraphQLJSONObject

  # Union type for a Slate op because I'm too lazy to specify all this in GraphQL...
  type SlateOp {
    type: String!
    path: [Int!]
    newPath: [Int!]
    node: GraphQLJSONObject
    text: String
    offset: Int
    position: Int
    properties: GraphQLJSONObject
    newProperties: GraphQLJSONObject
  }

  extend type Query {
    suggestNotebookChanges(notebookId: String!, prompt: String!): [SlateOp]
  }
`;
