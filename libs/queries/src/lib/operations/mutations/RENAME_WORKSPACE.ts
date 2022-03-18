import { gql, MutationTuple, useMutation } from '@apollo/client';
import {
  RenameWorkspace,
  RenameWorkspaceVariables,
} from './__generated__/RenameWorkspace';

export const RENAME_WORKSPACE = gql`
  mutation RenameWorkspace($id: ID!, $name: String!) {
    updateWorkspace(id: $id, workspace: { name: $name }) {
      id
      name
    }
  }
`;

export const useRenameWorkspace = (
  variables?: RenameWorkspaceVariables
): MutationTuple<RenameWorkspace, RenameWorkspaceVariables> =>
  useMutation<RenameWorkspace, RenameWorkspaceVariables>(RENAME_WORKSPACE, {
    variables,
    refetchQueries: ['GetWorkspaceById'],
    awaitRefetchQueries: true,
  });
