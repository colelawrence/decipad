/* eslint decipad/css-prop-named-variable: 0 */
import { useWorkspacePermission } from '@decipad/graphql-client';
import { useThemeFromStore } from '@decipad/react-contexts';
import { mediumShadow } from '@decipad/ui';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { AccountAvatar } from '../../molecules';

import { Sidebar } from '../../icons/Sidebar/Sidebar';
import {
  AccountMenu,
  WorkspaceLogo,
  WorkspaceNavigation,
  WorkspaceOptions,
} from '../../organisms';
import { MobileSidebar } from '../../organisms/MobileSidebar/MobileSidebar';
import {
  black,
  cssVar,
  smallScreenQuery,
  transparency,
} from '../../primitives';
import { dashboard } from '../../styles';

type DashboardSidebarProps = ComponentProps<typeof WorkspaceOptions> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  Omit<ComponentProps<typeof AccountMenu>, 'onOpenSettings'> &
  Pick<
    ComponentProps<typeof WorkspaceNavigation>,
    | 'onDeleteSection'
    | 'onCreateSection'
    | 'onUpdateSection'
    | 'showFeedback'
    | 'activeWorkspace'
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
  const permission = useWorkspacePermission(props.activeWorkspace.id);
  const showSettingsAndMembers = permission === 'ADMIN';

  const dashboardEl = (
    <div css={dashboardMainSidebarStyles} onPointerEnter={onPointerEnter}>
      <div
        css={[
          {
            gridColumn: 'action',
            display: 'grid',
          },
          dashboardSidebarStyles(),
          dashboardPartHideOnMobile(),
          { padding: '12px 16px' },
        ]}
      >
        <div css={{ gridRow: 'navigation', display: 'grid' }}>
          <WorkspaceNavigation
            {...props}
            enableSettingsAndMembers={showSettingsAndMembers}
          />
        </div>
        <div
          css={{
            gridRow: 'switcher',
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 100%)',
          }}
        >
          <WorkspaceLogo {...props} />
        </div>
      </div>
    </div>
  );

  return (
    <MobileSidebar trigger={<MobileSidebarButton />}>
      {dashboardEl}
    </MobileSidebar>
  );
};

const MobileSidebarButton: React.FC = () => {
  const [isDarkMode] = useThemeFromStore();

  return (
    <div css={dashboardButtonStyles(isDarkMode)}>
      <Sidebar />
    </div>
  );
};

export const dashboardButtonStyles = (isDarkMode: boolean) =>
  css({
    height: '48px',
    width: '48px',
    borderRadius: '50%',
    margin: '16px',

    boxShadow: isDarkMode
      ? `0px 2px 6px 0px ${transparency(black, 0.5).rgba}`
      : `0px 3px 24px -4px ${mediumShadow.rgba}`,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    svg: {
      height: '24px',
      width: '24px',
    },
  });

const dashboardSidebarStyles = () =>
  css({
    padding: dashboard.topPadding,

    display: 'grid',
    gridTemplateRows: '[switcher] auto [navigation] 1fr',
    rowGap: '20px',
    backgroundColor: cssVar('backgroundColor'),
    [smallScreenQuery]: {
      padding: `${dashboard.topPadding} 24px 0px`,

      minHeight: '100vh',
      height: '100%',
    },
  });

const dashboardPartHideOnMobile = () =>
  css({
    [smallScreenQuery]: {
      minWidth: '272px',
      padding: '16px',
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
