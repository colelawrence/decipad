import { useThemeFromStore } from '@decipad/react-contexts';
import { useActiveElement } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useState } from 'react';
import { ThemePicker } from '../../atoms';
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
  ComponentProps<typeof AccountMenu> &
  Pick<
    ComponentProps<typeof WorkspaceNavigation>,
    'onDeleteSection' | 'onCreateSection' | 'onUpdateSection'
  > & {
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
  const [darkTheme, setDarkTheme] = useThemeFromStore();
  const [openMenu, setOpenMenu] = useState(false);

  const ref = useActiveElement(() => {
    setOpenMenu(false);
  });

  return (
    <div css={dashboardMainSidebarStyles} onPointerEnter={onPointerEnter}>
      <div css={workspaceSwitcherStyles}>
        <div css={workspaceSwitcherFlexyStyles}>
          <WorkspaceSelector {...props}></WorkspaceSelector>
          <div css={themeSwitcherAndConfigStyles}>
            <div
              css={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'center',
                gap: 32,
              }}
            >
              <ThemePicker
                active={darkTheme}
                onChange={setDarkTheme}
                ariaRoleDescription={'theme picker'}
              ></ThemePicker>
              <div ref={ref}>
                <AccountAvatar
                  menuOpen={openMenu}
                  name={name}
                  email={email}
                  onClick={() => setOpenMenu(!openMenu)}
                />
                {openMenu && (
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
        <div
          css={{
            gridRow: 'switcher',
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 100%)',
          }}
        >
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
