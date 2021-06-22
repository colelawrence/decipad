import { gql, useMutation } from '@apollo/client';

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($id: ID!) {
    removeWorkspace(id: $id)
  }
`;

export interface DeleteWorkspace {
  removeWorkspace: boolean;
}

export interface DeleteWorkspaceVars {
  id: string;
}

export const useDeleteWorkspace = ({ id }: DeleteWorkspaceVars) =>
  useMutation<DeleteWorkspace, DeleteWorkspaceVars>(DELETE_WORKSPACE, {
    variables: { id },
    refetchQueries: ['Workspaces'],
    awaitRefetchQueries: true,
  });
