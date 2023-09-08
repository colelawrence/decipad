import { ComponentProps, useMemo } from 'react';
import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { useSession } from 'next-auth/react';
import { User } from '@decipad/interfaces';
import { useStripeLinks } from '@decipad/react-utils';
import { ClosableModal, WorkspaceMembers } from '../../organisms';
import { EditMembersPaywall } from './EditMembersPaywall.private';
import { ClosableModalHeader } from '../../molecules';

type EditWorkspaceModalProps = {
  readonly closeHref: string;
  readonly currentWorkspace: DashboardWorkspaceFragment;
} & Pick<ComponentProps<typeof ClosableModalHeader>, 'Heading'>;

export const EditMembersModal: React.FC<EditWorkspaceModalProps> = ({
  closeHref,
  currentWorkspace,

  ...modalProps
}) => {
  const { data: session } = useSession();
  const user = session?.user as User;
  const currentUserId = user?.id;
  const { paymentLink } = useStripeLinks(currentWorkspace);

  const members = useMemo(
    () => [
      ...(currentWorkspace.access?.users?.map((u) => ({
        ...u,
        canComment: true,
      })) ?? []),
      ...(currentWorkspace.access?.roles?.flatMap((access) =>
        access.role.users?.map((roleUser) => ({
          permission: access.permission,
          // currentSpace is not aware if the user updated their details
          user: roleUser.id === currentUserId ? user : roleUser,
          canComment: true,
        }))
      ) ?? []),
    ],
    [currentWorkspace, currentUserId, user]
  );

  if (paymentLink) {
    return (
      <EditMembersPaywall closeHref={closeHref} paymentHref={paymentLink} />
    );
  }

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
