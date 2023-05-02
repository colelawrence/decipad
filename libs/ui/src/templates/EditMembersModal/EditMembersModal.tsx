import React, { ComponentProps } from 'react';
import { ClosableModal, WorkspaceMembers } from '../../organisms';

type EditWorkspaceModalProps = {
  readonly name: string;
  readonly closeHref: string;
  readonly workspaceMembers: ComponentProps<typeof WorkspaceMembers>;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const EditMembersModal: React.FC<EditWorkspaceModalProps> = ({
  name,
  closeHref,
  workspaceMembers,

  ...modalProps
}) => {
  return (
    <ClosableModal
      {...modalProps}
      title="Workspace members"
      closeAction={closeHref}
    >
      <WorkspaceMembers {...workspaceMembers} />
    </ClosableModal>
  );
};
