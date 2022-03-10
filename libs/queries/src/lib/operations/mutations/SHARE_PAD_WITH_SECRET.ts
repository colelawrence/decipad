import { gql, useMutation } from '@apollo/client';
import { PermissionType } from '@decipad/queries';
import {
  SharePadWithSecret,
  SharePadWithSecretVariables,
} from './__generated__/SharePadWithSecret';

export const SHARE_PAD_WITH_SECRET = gql`
  mutation SharePadWithSecret(
    $id: ID!
    $permissionType: PermissionType!
    $canComment: Boolean!
  ) {
    sharePadWithSecret(
      id: $id
      permissionType: $permissionType
      canComment: $canComment
    )
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useShareNotebookWithSecret = (
  notebookId: string,
  permission: PermissionType
) =>
  useMutation<SharePadWithSecret, SharePadWithSecretVariables>(
    SHARE_PAD_WITH_SECRET,
    {
      refetchQueries: ['GetPadById'],
      awaitRefetchQueries: true,
      variables: {
        id: notebookId,
        permissionType: permission,
        canComment: false,
      },
    }
  );
