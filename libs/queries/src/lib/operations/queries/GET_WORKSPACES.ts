import { gql } from '@apollo/client';

export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      pads(page: { maxItems: 10000 }) {
        items {
          id
          name
        }
      }
    }
  }
`;
