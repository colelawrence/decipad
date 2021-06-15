import { gql } from '@apollo/client';

export const GET_WORKSPACE_BY_ID = gql`
  query GetWorkspaceById($id: ID!) {
    getWorkspaceById(id: $id) {
      id
      name
    }
  }
`;
