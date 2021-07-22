import { gql } from '@apollo/client';

export const COUNT_PADS = gql`
  query CountPads($workspaceId: ID!) {
    pads(workspaceId: $workspaceId, page: { maxItems: 10000 }) {
      count
    }
  }
`;
