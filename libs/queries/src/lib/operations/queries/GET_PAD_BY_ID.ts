/* eslint-disable camelcase */
import { gql, useQuery } from '@apollo/client';
import {
  GetPadById,
  GetPadByIdVariables,
  GetPadById_getPadById,
} from './__generated__/GetPadById';

export const GET_PAD_BY_ID = gql`
  query GetPadById($id: ID!) {
    getPadById(id: $id) {
      id
      name
      myPermissionType
      icon
      isPublic
      access {
        users {
          user {
            id
            name
          }
          permission
        }
        secrets {
          permission
          secret
        }
      }
      workspace {
        id
        name
      }
    }
  }
`;

type UseGetNotebookById = {
  notebook?: GetPadById_getPadById | null;
  readOnly: boolean;
  notebookLoading: boolean;
};

export const useGetNotebookById = (
  notebookId: string,
  secret?: string
): UseGetNotebookById => {
  const { data, loading } = useQuery<GetPadById, GetPadByIdVariables>(
    GET_PAD_BY_ID,
    {
      variables: { id: notebookId },
      context: secret
        ? { headers: { authorization: `Bearer ${secret}` } }
        : undefined,
    }
  );

  return {
    notebook: data?.getPadById,
    readOnly: data?.getPadById?.myPermissionType === 'READ',
    notebookLoading: loading,
  };
};
