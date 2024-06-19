import { ShallowWorkspaceFragment } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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

  const location = useLocation();
  const lastUrlPath = location.pathname.split('/').at(-1);

  return (
    <Modal
      title="Data connections"
      size="xl"
      onClose={onClose}
      defaultOpen={true}
    >
      <div css={modalWrapper}>
        <TabsRoot
          styles={fullWidth}
          defaultValue={lastUrlPath ?? 'integrations'}
          onValueChange={(newTab: string) => {
            switch (newTab) {
              case 'code-secrets':
                navigate(connections.codeSecrets({}).$);
                break;
              case 'webhooks':
                navigate(connections.webhooks({}).$);
                break;
              case 'sql-connections':
                navigate(connections.sqlConnections({}).$);
                break;
              case 'integrations':
                navigate(connections.integrations({}).$);
                break;
              case 'datasets':
                navigate(connections.datasets({}).$);
                break;
              default:
                console.warn('This tab is not available');
                break;
            }
          }}
        >
          <TabsList>
            {isFlagEnabled('NOTION_CONNECTIONS') && (
              <>
                <TabsTrigger
                  name="integrations"
                  trigger={{
                    label: 'Integrations',
                    disabled: false,
                  }}
                />
                <TabsTrigger
                  name="datasets"
                  trigger={{
                    label: 'Datasets',
                    disabled: false,
                  }}
                />
              </>
            )}
            <TabsTrigger
              name="code-secrets"
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
              name="sql-connections"
              trigger={{
                label: 'SQL',
                disabled: false,
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
  height: '480px',
  gap: '20px',
});

const fullWidth = css({
  width: '100%',
});
