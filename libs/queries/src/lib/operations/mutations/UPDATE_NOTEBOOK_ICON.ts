import { gql, MutationTuple, useMutation } from '@apollo/client';
import {
  UpdateNotebookIcon,
  UpdateNotebookIconVariables,
} from './__generated__/UpdateNotebookIcon';

export const UPDATE_NOTEBOOK_ICON = gql`
  mutation UpdateNotebookIcon($id: ID!, $icon: String!) {
    updatePad(id: $id, pad: { icon: $icon }) {
      __typename
    }
  }
`;

export const useUpdateNotebookIcon = (
  notebookId: string,
  newIcon: string
): MutationTuple<UpdateNotebookIcon, UpdateNotebookIconVariables> =>
  useMutation<UpdateNotebookIcon, UpdateNotebookIconVariables>(
    UPDATE_NOTEBOOK_ICON,
    { variables: { id: notebookId, icon: newIcon } }
  );
