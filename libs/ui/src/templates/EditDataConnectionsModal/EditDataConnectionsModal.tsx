import { ComponentProps } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardWorkspaceFragment } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { workspaces } from '@decipad/routing';
import { isFlagEnabled } from '@decipad/feature-flags';
import { ClosableModal } from '../../organisms';
import { ClosableModalHeader } from '../../molecules';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { TextAndIconButton } from '../../atoms';

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
      title="Live connection secrets"
      closeAction={closeHref}
    >
      <div css={modalWrapper}>
        <div css={fullWidth}>
          <Tabs variant>
            <TextAndIconButton
              size="normal"
              text="Code Secrets"
              variantHover
              notSelectedLook={pathname !== connections.codeSecrets({}).$}
              color={
                pathname === connections.codeSecrets({}).$
                  ? 'grey'
                  : 'transparent'
              }
              onClick={() => navigate(connections.codeSecrets({}).$)}
            />
            {isFlagEnabled('WORKSPACE_CONNECTIONS') && (
              <TextAndIconButton
                size="normal"
                text="SQL Connections"
                variantHover
                notSelectedLook={pathname !== connections.sqlConnections({}).$}
                color={
                  pathname === connections.sqlConnections({}).$
                    ? 'grey'
                    : 'transparent'
                }
                onClick={() => navigate(connections.sqlConnections({}).$)}
              />
            )}
          </Tabs>
        </div>
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
  height: '632px',
  gap: '20px',
});

const fullWidth = css({
  width: '100%',
});
