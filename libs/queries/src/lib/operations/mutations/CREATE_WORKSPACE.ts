import { gql } from '@apollo/client';

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!) {
    createWorkspace(workspace: { name: $name }) {
      id
      name
    }
  }
`;
