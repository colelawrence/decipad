import { gql } from '@apollo/client';

export const REMOVE_PAD = gql`
  mutation RemovePad($id: ID!) {
    removePad(id: $id)
  }
`;
