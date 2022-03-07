import { gql } from '@apollo/client';

export const IMPORT_PAD = gql`
  mutation ImportPad($workspaceId: ID!, $source: String!) {
    importPad(workspaceId: $workspaceId, source: $source) {
      id
      name
    }
  }
`;
