import { useMemo } from 'react';
import {
  ShallowWorkspaceFragment,
  UserAccessMetaFragment,
  SubscriptionPlan,
} from '@decipad/graphql-client';
import { useSession } from 'next-auth/react';
import { User } from '@decipad/interfaces';
import { Modal } from '../../../shared';

import { WorkspaceMembers } from '../WorkspaceMembers/WorkspaceMembers';

type EditWorkspaceModalProps = {
  readonly onClose: () => void;
  readonly currentWorkspace: ShallowWorkspaceFragment;
  readonly currentSubscriptionPlan?: SubscriptionPlan | null;
};

export const EditMembersModal: React.FC<EditWorkspaceModalProps> = ({
  onClose,
  currentWorkspace,
  currentSubscriptionPlan,
}) => {
  const { data: session } = useSession();
  const user = session?.user as User;
  const currentUserId = user?.id;

  const members = useMemo(
    (): Array<UserAccessMetaFragment> => [
      ...(currentWorkspace.access?.users?.map((u) => ({
        ...u,
        canComment: true,
      })) ?? []),
    ],
    [currentWorkspace]
  );

  const canInviteEditors = useMemo(() => {
    return (currentSubscriptionPlan?.editors || 0) > members.length;
  }, [members, currentSubscriptionPlan?.editors]);

  return (
    <Modal title="Workspace members" onClose={onClose} defaultOpen={true}>
      <WorkspaceMembers
        currentUserId={currentUserId}
        workspaceMembers={members}
        workspaceId={currentWorkspace.id}
        canInviteEditors={canInviteEditors}
      />
    </Modal>
  );
};
