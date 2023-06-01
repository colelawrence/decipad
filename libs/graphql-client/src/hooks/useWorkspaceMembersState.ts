/* eslint-disable no-console */
import { useCallback } from 'react';
import { useToast } from '@decipad/toast';
import {
  PermissionType,
  useChangeWorkspaceAccessLevelMutation,
  useShareWorkspaceWithEmailMutation,
  useUnshareWorkspaceWithUserMutation,
} from '..';

export const useWorkspaceMembersState = () => {
  const toast = useToast();
  const [, shareWorkspace] = useShareWorkspaceWithEmailMutation();
  const [, unshareWorkspace] = useUnshareWorkspaceWithUserMutation();
  const [, changeWorkspaceAccess] = useChangeWorkspaceAccessLevelMutation();

  // TODO: maybe useMutationResultHandler here?

  const invite = useCallback(
    async (id: string, email: string, permissionType: string) => {
      try {
        await shareWorkspace({
          workspaceId: id,
          email,
          permissionType: permissionType as PermissionType,
          canComment: true,
        });
      } catch (err) {
        console.error('Failed to share workspace. Error:', err);
        toast('Failed to share workspace.', 'error');
      }
    },
    [shareWorkspace]
  );

  const revoke = useCallback(
    async (id: string, userId: string) => {
      try {
        await unshareWorkspace({
          workspaceId: id,
          userId,
        });
      } catch (err) {
        console.error('Failed to revoke workspace access. Error:', err);
        toast('Failed to revoke workspace access.', 'error');
      }
    },
    [unshareWorkspace]
  );

  const changePermission = useCallback(
    async (id: string, email: string, permissionType: string) => {
      try {
        await changeWorkspaceAccess({
          workspaceId: id,
          email,
          permissionType: permissionType as PermissionType,
          canComment: true,
        });
      } catch (err) {
        console.error('Failed to change workspace permission. Error:', err);
        toast('Failed to change workspace permission.', 'error');
      }
    },
    [changeWorkspaceAccess]
  );

  return { invite, revoke, changePermission };
};
