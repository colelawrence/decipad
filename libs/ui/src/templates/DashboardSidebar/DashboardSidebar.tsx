import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { AccountAvatar } from '../../molecules';

import {
  AccountMenu,
  WorkspaceLogo,
  WorkspaceNavigation,
  WorkspaceOptions,
  WorkspaceSwitcher,
} from '../../organisms';
import { cssVar, smallScreenQuery } from '../../primitives';
import { dashboard } from '../../styles';
import { useEditUserModalStore } from '../EditUserModal/EditUserModal';

type DashboardSidebarProps = ComponentProps<typeof WorkspaceOptions> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  Omit<ComponentProps<typeof AccountMenu>, 'onOpenSettings'> &
  Pick<
    ComponentProps<typeof WorkspaceNavigation>,
    'onDeleteSection' | 'onCreateSection' | 'onUpdateSection' | 'showFeedback'
  > & {
    readonly onPointerEnter?: () => void;
  };

export const DashboardSidebar = ({
  onPointerEnter,
  name,
  email,
  onLogout,
  ...props
}: DashboardSidebarProps): ReturnType<FC> => {
  const showSwitcher = !isFlagEnabled('NO_WORKSPACE_SWITCHER');
  const openUserSettings = useEditUserModalStore((state) => state.open);

  return (
    <div css={dashboardMainSidebarStyles} onPointerEnter={onPointerEnter}>
      {showSwitcher && (
        <WorkspaceSwitcher
          name={name}
          email={email}
          onLogout={onLogout}
          {...props}
          onOpenSettings={openUserSettings}
        />
      )}
      <div
        css={[
          {
            gridColumn: 'action',
            display: 'grid',
          },
          dashboardSidebarStyles,
          dashboardPartHideOnMobile,
          { padding: '12px 16px' },
        ]}
      >
        <div css={{ gridRow: 'navigation', display: 'grid' }}>
          <WorkspaceNavigation {...props} />
        </div>
        <div
          css={{
            gridRow: 'switcher',
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 100%)',
          }}
        >
          {showSwitcher ? (
            <WorkspaceOptions {...props} />
          ) : (
            <WorkspaceLogo {...props} />
          )}
        </div>
      </div>
    </div>
  );
};

const dashboardSidebarStyles = css({
  padding: dashboard.topPadding,

  display: 'grid',
  gridTemplateRows: '[switcher] auto [navigation] 1fr',
  rowGap: '20px',
  borderLeft: `1px solid ${cssVar('borderColor')}`,
  borderTopLeftRadius: '20px',
  borderBottomLeftRadius: '20px',
  backgroundColor: cssVar('backgroundColor'),
  [smallScreenQuery]: {
    padding: `${dashboard.topPadding} 24px 0px`,
  },
});

const dashboardPartHideOnMobile = css({
  [smallScreenQuery]: {
    display: 'none',
  },
});

const dashboardMainSidebarStyles = css({
  display: 'grid',
  backgroundColor: cssVar('highlightColor'),

  gridTemplateColumns: '[workspaceselector] auto [action] 1fr',
  [smallScreenQuery]: {
    display: 'flex',
    gap: '20px',
  },
});
