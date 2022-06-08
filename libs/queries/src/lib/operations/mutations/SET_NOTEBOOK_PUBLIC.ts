import { gql, useMutation } from '@apollo/client';

export const SET_NOTEBOOK_PUBLIC = gql`
  mutation setPadPublic($id: ID!, $isPublic: Boolean!) {
    setPadPublic(id: $id, isPublic: $isPublic) {
      id
      isPublic
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useSetNotebookPublic = (notebookId: string, isPublic: boolean) =>
  useMutation(SET_NOTEBOOK_PUBLIC, {
    refetchQueries: ['GetPadById'],
    awaitRefetchQueries: true,
    variables: {
      id: notebookId,
      isPublic,
    },
  });
