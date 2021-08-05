import { gql, MutationTuple, useMutation } from '@apollo/client';

export const RENAME_WORKSPACE = gql`
  mutation RenameWorkspace($id: ID!, $name: String!) {
    updateWorkspace(id: $id, workspace: { name: $name }) {
      id
      name
    }
  }
`;

export interface RenameWorkspace {
  updateWorkspace: {
    id: string;
    name: string;
  };
}

export interface RenameWorkspaceVars {
  id: string;
  name: string;
}

export const useRenameWorkspace = ({
  id,
  name,
}: RenameWorkspaceVars): MutationTuple<RenameWorkspace, RenameWorkspaceVars> =>
  useMutation<RenameWorkspace, RenameWorkspaceVars>(RENAME_WORKSPACE, {
    variables: { id, name },
    refetchQueries: ['GetWorkspaceById'],
    awaitRefetchQueries: true,
  });
