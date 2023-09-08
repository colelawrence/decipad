import { NotebookAccessActionsReturn } from '@decipad/interfaces';
import { useCallback } from 'react';
import {
  PermissionType,
  useSharePadWithEmailMutation,
  useUnsharePadWithUserMutation,
  useUpdatePadPermissionMutation,
} from '@decipad/graphql-client';
import { useMutationResultHandler } from '../utils';

/**
 * Hook that provides actions to changes permissions in a notebook.
 *
 * We don't want to bind the hook to a specific notebookId because we might
 * want to use it on any notebook (imagine permissions from workspace).
 */
export function useNotebookAccessActions(): NotebookAccessActionsReturn {
  const shareNotebookWithEmail = useMutationResultHandler(
    useSharePadWithEmailMutation()[1],
    'Unable to share notebook'
  );
  const updatePadPermission = useMutationResultHandler(
    useUpdatePadPermissionMutation()[1],
    'Unable to update notebook permissions'
  );

  const unsharePadWithUser = useMutationResultHandler(
    useUnsharePadWithUserMutation()[1],
    'Unable to unshare notebook'
  );

  const onInviteByEmail = useCallback<
    NotebookAccessActionsReturn['onInviteByEmail']
  >(
    async (padId, email, permissionType) => {
      await shareNotebookWithEmail({
        padId,
        email,
        permissionType: permissionType as unknown as PermissionType,
        canComment: true,
      });
    },
    [shareNotebookWithEmail]
  );

  const onChangeAccess = useCallback<
    NotebookAccessActionsReturn['onChangeAccess']
  >(
    async (padId, userId, permissionType) => {
      await updatePadPermission({
        padId,
        userId,
        permissionType: permissionType as unknown as PermissionType,
        canComment: true,
      });
    },
    [updatePadPermission]
  );

  const onRemoveAccess = useCallback<
    NotebookAccessActionsReturn['onRemoveAccess']
  >(
    async (padId, userId) => {
      await unsharePadWithUser({
        padId,
        userId,
      });
    },
    [unsharePadWithUser]
  );

  return {
    onInviteByEmail,
    onChangeAccess,
    onRemoveAccess,
  };
}
