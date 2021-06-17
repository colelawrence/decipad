import { gql } from '@apollo/client';

export const CREATE_PAD = gql`
  mutation CreatePad($workspaceId: ID!, $name: String!) {
    createPad(workspaceId: $workspaceId, pad: { name: $name }) {
      id
      name
    }
  }
`;
