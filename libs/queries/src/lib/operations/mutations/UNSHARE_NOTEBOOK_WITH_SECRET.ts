import { gql, MutationTuple, useMutation } from '@apollo/client';
import {
  UnshareNotebookWithSecret,
  UnshareNotebookWithSecretVariables,
} from '..';

export const UNSHARE_NOTEBOOK_WITH_SECRET = gql`
  mutation UnshareNotebookWithSecret($id: ID!, $secret: String!) {
    unshareNotebookWithSecret(id: $id, secret: $secret)
  }
`;

export const useUnshareNotebookWithSecret = (
  notebookId: string,
  secret: string
): MutationTuple<
  UnshareNotebookWithSecret,
  UnshareNotebookWithSecretVariables
> =>
  useMutation<UnshareNotebookWithSecret, UnshareNotebookWithSecretVariables>(
    UNSHARE_NOTEBOOK_WITH_SECRET,
    {
      variables: {
        id: notebookId,
        secret,
      },
      refetchQueries: ['GetPadById'],
      awaitRefetchQueries: true,
    }
  );
