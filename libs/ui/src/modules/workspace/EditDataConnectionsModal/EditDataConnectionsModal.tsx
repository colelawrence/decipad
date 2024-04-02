import { ShallowWorkspaceFragment } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Modal, TabsList, TabsRoot, TabsTrigger } from '../../../shared';
import { isFlagEnabled } from '@decipad/feature-flags';

type EditDataConnectionsModalProps = {
  readonly onClose: () => void;
  readonly currentWorkspace: ShallowWorkspaceFragment;
};

export const EditDataConnectionsModal: React.FC<
  EditDataConnectionsModalProps
> = ({ onClose, currentWorkspace }) => {
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
        <TabsRoot
          styles={fullWidth}
          defaultValue={'secrets'}
          onValueChange={(newTab: string) => {
            switch (newTab) {
              case 'secrets':
                navigate(connections.codeSecrets({}).$);
                break;
              case 'webhooks':
                navigate(connections.webhooks({}).$);
                break;
              case 'connections':
                navigate(connections.sqlConnections({}).$);
                break;
              case 'services':
                navigate(connections.services({}).$);
                break;
              default:
                console.warn('This tab is not available');
                break;
            }
          }}
        >
          <TabsList>
            <TabsTrigger
              name="secrets"
              trigger={{
                label: 'API Secrets',
                disabled: false,
              }}
            />
            <TabsTrigger
              name="webhooks"
              trigger={{
                label: 'Webhooks',
                disabled: false,
              }}
            />
            <TabsTrigger
              name="connections"
              trigger={{
                label: 'SQL',
                disabled: false,
              }}
            />
            {isFlagEnabled('NOTION_CONNECTIONS') && (
              <TabsTrigger
                name="services"
                trigger={{
                  label: 'Services',
                  disabled: false,
                }}
              />
            )}
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
  height: '480px',
  gap: '20px',
});

const fullWidth = css({
  width: '100%',
});
