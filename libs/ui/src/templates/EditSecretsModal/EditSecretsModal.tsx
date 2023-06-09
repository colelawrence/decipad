import { ComponentProps } from 'react';
import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { ClosableModal, WorkspaceSecrets } from '../../organisms';

type EditSecretsModalProps = {
  readonly closeHref: string;
  readonly currentWorkspace: DashboardWorkspaceFragment;
} & Pick<ComponentProps<typeof ClosableModal>, 'Heading'>;

export const EditSecretsModal: React.FC<EditSecretsModalProps> = ({
  closeHref,
  currentWorkspace,

  ...modalProps
}) => {
  return (
    <ClosableModal
      {...modalProps}
      title="Live connection secrets"
      closeAction={closeHref}
    >
      <WorkspaceSecrets workspaceId={currentWorkspace.id} />
    </ClosableModal>
  );
};
