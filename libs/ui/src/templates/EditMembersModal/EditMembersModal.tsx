import { ComponentProps, useMemo } from 'react';
import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { useSession } from 'next-auth/react';
import { User } from '@decipad/interfaces';
import { ClosableModal, WorkspaceMembers } from '../../organisms';

type EditWorkspaceModalProps = {
  readonly closeHref: string;
  readonly currentWorkspace: DashboardWorkspaceFragment;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const EditMembersModal: React.FC<EditWorkspaceModalProps> = ({
  closeHref,
  currentWorkspace,

  ...modalProps
}) => {
  const { data: session } = useSession();
  const user = session?.user as User;
  const currentUserId = user?.id;

  const members = useMemo(
    () => [
      ...(currentWorkspace.access?.users ?? []),
      ...(currentWorkspace.access?.roles?.flatMap((access) =>
        access.role.users?.map((roleUser) => ({
          permission: access.permission,
          user: roleUser,
          canComment: true,
        }))
      ) ?? []),
    ],
    [currentWorkspace]
  );

  return (
    <ClosableModal
      {...modalProps}
      title="Workspace members"
      closeAction={closeHref}
    >
      <WorkspaceMembers
        currentUserId={currentUserId}
        workspaceMembers={members}
        workspaceId={currentWorkspace.id}
      />
    </ClosableModal>
  );
};
