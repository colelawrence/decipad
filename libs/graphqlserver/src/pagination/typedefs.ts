import { gql } from 'apollo-server-lambda';

export default gql`
  input PageInput {
    cursor: String
    maxItems: Int!
  }

  type PagedResult {
    items: [Pageable!]!
    count: Int!
    hasNextPage: Boolean!
    cursor: String
  }

  union Pageable = SharedResource | ExternalDataSource
`;
