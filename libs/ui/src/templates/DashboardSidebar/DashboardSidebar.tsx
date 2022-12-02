import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useState } from 'react';
import { AccountAvatar } from '../../molecules';
import {
  AccountMenu,
  WorkspaceNavigation,
  WorkspaceOptions,
  WorkspaceSelector,
} from '../../organisms';
import { cssVar, smallScreenQuery } from '../../primitives';
import { dashboard } from '../../styles';

type DashboardSidebarProps = ComponentProps<typeof WorkspaceOptions> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  ComponentProps<typeof AccountMenu> & {
    readonly onPointerEnter?: () => void;
  };

export const DashboardSidebar = ({
  onPointerEnter,
  name,
  email,
  onLogout,
  onOpenSettings,
  ...props
}: DashboardSidebarProps): ReturnType<FC> => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenuOpen = useCallback(() => setMenuOpen((o) => !o), []);
  return (
    <div css={dashboardMainSidebarStyles} onPointerEnter={onPointerEnter}>
      <div css={workspaceSwitcherStyles}>
        <div css={workspaceSwitcherFlexyStyles}>
          <WorkspaceSelector {...props}></WorkspaceSelector>
          <div css={themeSwitcherAndConfigStyles}>
            <div>
              <AccountAvatar
                menuOpen={menuOpen}
                name={name}
                onClick={toggleMenuOpen}
              />
              {menuOpen && (
                <div
                  css={{
                    position: 'absolute',
                    minWidth: '240px',
                    width: 'max-content',
                    maxWidth: '50vw',
                    bottom: 20,
                    left: '60px',
                    zIndex: 2,
                  }}
                >
                  <AccountMenu
                    onOpenSettings={onOpenSettings}
                    name={name}
                    email={email}
                    onLogout={onLogout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
        <div css={{ gridRow: 'switcher', display: 'grid' }}>
          <WorkspaceOptions {...props} />
        </div>
      </div>
    </div>
  );
};

const workspaceSwitcherFlexyStyles = css({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const dashboardSidebarStyles = css({
  padding: dashboard.topPadding,

  display: 'grid',
  gridTemplateRows: '[switcher] auto [navigation] 1fr',
  rowGap: '20px',
  borderLeft: `1px solid ${cssVar('strongerHighlightColor')}`,
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

const workspaceSwitcherStyles = css({
  gridColumn: 'workspaceselector',

  display: 'grid',
  [smallScreenQuery]: {
    display: 'inline-flex',
    gridColumn: 'initial',
    width: '100%',
  },
});

const themeSwitcherAndConfigStyles = css({
  marginBottom: '22px',
  [smallScreenQuery]: {
    display: 'none',
    marginBottom: '0px',
  },
});
