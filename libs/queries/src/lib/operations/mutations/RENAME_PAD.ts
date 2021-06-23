import { gql } from '@apollo/client';

export const RENAME_PAD = gql`
  mutation RenamePad($padId: ID!, $name: String!) {
    updatePad(id: $padId, pad: { name: $name }) {
      id
      name
    }
  }
`;
