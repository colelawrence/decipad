import { gql } from '@apollo/client';

export const GET_PADS = gql`
  query GetPads($workspaceId: ID!) {
    pads(workspaceId: $workspaceId, page: { maxItems: 5 }) {
      items {
        id
        name
      }
    }
  }
`;
