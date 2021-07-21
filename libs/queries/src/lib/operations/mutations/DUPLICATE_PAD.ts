import { gql } from '@apollo/client';

export const DUPLICATE_PAD = gql`
  mutation DuplicatePad($id: ID!) {
    duplicatePad(id: $id) {
      id
      name
    }
  }
`;
