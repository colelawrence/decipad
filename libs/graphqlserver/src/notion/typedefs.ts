import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Query {
    getNotion(url: String!, notebookId: ID!): String!
  }
`;
