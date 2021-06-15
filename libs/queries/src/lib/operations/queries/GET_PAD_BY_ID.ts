import { gql } from '@apollo/client';

export const GET_PAD_BY_ID = gql`
  query GetPadById($id: ID!) {
    getPadById(id: $id) {
      id
      name
    }
  }
`;
