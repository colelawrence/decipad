/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { mediumShadow } from '@decipad/ui';
import { useThemeFromStore } from '@decipad/react-contexts';
import { AccountAvatar } from '../../molecules';

import {
  AccountMenu,
  WorkspaceLogo,
  WorkspaceNavigation,
  WorkspaceOptions,
  WorkspaceSwitcher,
} from '../../organisms';
import {
  cssVar,
  smallScreenQuery,
  transparency,
  black,
} from '../../primitives';
import { dashboard } from '../../styles';
import { useEditUserModalStore } from '../EditUserModal/EditUserModal';
import { MobileSidebar } from '../../organisms/MobileSidebar/MobileSidebar';
import { Sidebar } from '../../icons/Sidebar/Sidebar';

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

  const dashboardEl = (
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
          dashboardSidebarStyles(showSwitcher),
          dashboardPartHideOnMobile(showSwitcher),
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

  if (isFlagEnabled('NO_WORKSPACE_SWITCHER')) {
    return (
      <MobileSidebar trigger={<MobileSidebarButton />}>
        {dashboardEl}
      </MobileSidebar>
    );
  }

  return dashboardEl;
};

const MobileSidebarButton: React.FC = () => {
  const [isDarkMode] = useThemeFromStore();

  return (
    <div css={dashboardButtonStyles(isDarkMode)}>
      <Sidebar />
    </div>
  );
};

const dashboardButtonStyles = (isDarkMode: boolean) =>
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

const dashboardSidebarStyles = (rounded: boolean) =>
  css(
    {
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
    },
    rounded && {
      borderTopLeftRadius: '20px',
      borderBottomLeftRadius: '20px',
      borderLeft: `1px solid ${cssVar('borderColor')}`,
    }
  );

const dashboardPartHideOnMobile = (legacySwitcher: boolean) =>
  css({
    [smallScreenQuery]: legacySwitcher
      ? {
          display: 'none',
        }
      : {
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
