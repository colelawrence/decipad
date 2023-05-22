import { UserAccess, useGetWorkspaceMembersQuery } from '..';

export const useWorkspaceMembers = (workspaceId: string) => {
  const { data: currentWorkspace } = useGetWorkspaceMembersQuery({
    variables: { workspaceId },
  })[0];

  const roles = currentWorkspace?.getWorkspaceById?.access?.roles || [];
  const users = currentWorkspace?.getWorkspaceById?.access?.users || [];

  const everyone: UserAccess[] = [
    ...users.map(
      (user): UserAccess => ({
        ...user,
        canComment: true,
      })
    ),
    ...roles.flatMap((rec) =>
      rec.role.users.map(
        (user): UserAccess => ({
          user,
          permission: rec.permission,
          canComment: true,
        })
      )
    ),
  ];

  return { roles, users, everyone };
};
