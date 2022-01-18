import { gql } from '@apollo/client';

export const DUPLICATE_PAD = gql`
  mutation DuplicatePad($id: ID!, $targetWorkspace: ID) {
    duplicatePad(id: $id, targetWorkspace: $targetWorkspace) {
      id
      name
    }
  }
`;
