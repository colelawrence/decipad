import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Modal, TabsList, TabsRoot, TabsTrigger } from '../../../shared';

type EditDataConnectionsModalProps = {
  readonly onClose: () => void;
  readonly currentWorkspace: DashboardWorkspaceFragment;
};

export const EditDataConnectionsModal: React.FC<
  EditDataConnectionsModalProps
> = ({ onClose, currentWorkspace }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const connections = workspaces({})
    .workspace({
      workspaceId: currentWorkspace.id,
    })
    .connections({});

  return (
    <Modal
      title="Integration Settings"
      size="xl"
      onClose={onClose}
      defaultOpen={true}
    >
      <div css={modalWrapper}>
        <TabsRoot css={fullWidth}>
          <TabsList>
            <TabsTrigger
              name="secrets"
              trigger={{
                label: 'API Secrets',
                onClick: () => navigate(connections.codeSecrets({}).$),
                disabled: false,
                selected: pathname === connections.codeSecrets({}).$,
              }}
            />
            <TabsTrigger
              name="webhooks"
              trigger={{
                label: 'Webhooks',
                onClick: () => navigate(connections.webhooks({}).$),
                disabled: false,
                selected: pathname === connections.webhooks({}).$,
              }}
            />
            <TabsTrigger
              name="connections"
              trigger={{
                label: 'SQL',
                onClick: () => navigate(connections.sqlConnections({}).$),
                disabled: false,
                selected: pathname === connections.sqlConnections({}).$,
              }}
            />
          </TabsList>
        </TabsRoot>

        <Outlet />
      </div>
    </Modal>
  );
};

const modalWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '580px',
  gap: '20px',
});

const fullWidth = css({
  width: '100%',
});
