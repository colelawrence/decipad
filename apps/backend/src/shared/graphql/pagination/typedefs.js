module.exports = ({ gql }) => gql`
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

  union Pageable = SharedResource
`;
