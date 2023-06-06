import { useSession } from 'next-auth/react';
import { useWorkspaceMembers } from './useWorkspaceMembers';
import { PermissionType } from '../generated';

export const useWorkspacePermission = (
  workspaceId: string
): PermissionType | undefined => {
  const session = useSession();
  const { everyone } = useWorkspaceMembers(workspaceId);

  const user = session.data?.user;
  const userId =
    user && 'id' in user && typeof user.id === 'string' ? user.id : null;

  const userAccess = everyone.find((access) => access.user.id === userId);

  return userAccess?.permission;
};
