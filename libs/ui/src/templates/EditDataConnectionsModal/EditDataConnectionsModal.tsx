import { ComponentProps } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { workspaces } from '@decipad/routing';
import { ClosableModal } from '../../organisms';
import { ClosableModalHeader } from '../../molecules';
import { TabsRoot, TabsList, TabsTrigger } from '@decipad/ui';

type EditDataConnectionsModalProps = {
  readonly closeHref: string;
  readonly currentWorkspace: DashboardWorkspaceFragment;
} & Pick<ComponentProps<typeof ClosableModalHeader>, 'Heading'>;

export const EditDataConnectionsModal: React.FC<
  EditDataConnectionsModalProps
> = ({
  closeHref,
  currentWorkspace,

  ...modalProps
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const connections = workspaces({})
    .workspace({
      workspaceId: currentWorkspace.id,
    })
    .connections({});

  return (
    <ClosableModal
      {...modalProps}
      title="Data Connections"
      closeAction={closeHref}
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
              name="connections"
              trigger={{
                label: 'SQL Connections',
                onClick: () => navigate(connections.sqlConnections({}).$),
                disabled: false,
                selected: pathname === connections.sqlConnections({}).$,
              }}
            />
          </TabsList>
        </TabsRoot>

        <Outlet />
      </div>
    </ClosableModal>
  );
};

const modalWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '740px',
  height: '580px',
  gap: '20px',
});

const fullWidth = css({
  width: '100%',
});
