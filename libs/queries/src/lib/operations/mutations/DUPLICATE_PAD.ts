import { gql, MutationTuple, useMutation } from '@apollo/client';
import { DuplicatePad, DuplicatePadVariables } from '..';

export const DUPLICATE_PAD = gql`
  mutation DuplicatePad($id: ID!, $targetWorkspace: ID, $document: String) {
    duplicatePad(
      id: $id
      targetWorkspace: $targetWorkspace
      document: $document
    ) {
      id
      name
    }
  }
`;

export const useDuplicateNotebook = (
  notebookId: string,
  targetWorkspaceId: string,
  secret: string
): MutationTuple<DuplicatePad, DuplicatePadVariables> =>
  useMutation<DuplicatePad, DuplicatePadVariables>(DUPLICATE_PAD, {
    variables: {
      id: notebookId,
      targetWorkspace: targetWorkspaceId,
    },
    context: {
      headers: {
        authorization: `Bearer ${secret}`,
      },
    },
  });
