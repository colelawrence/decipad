import { css } from '@emotion/react';
import { useThemeFromStore } from '@decipad/react-contexts';
import { useActiveElement } from '@decipad/react-utils';
import { useState, ComponentProps, useCallback } from 'react';
import { ThemePicker } from '../../atoms';
import { AccountAvatar } from '../../molecules';
import {
  AccountMenu,
  WorkspaceSelector,
  WorkspaceNavigation,
  WorkspaceOptions,
} from '..';
import { smallScreenQuery } from '../../primitives';
import { useEditUserModalStore } from '../../templates/EditUserModal/EditUserModal';

type DashboardSidebarProps = ComponentProps<typeof WorkspaceOptions> &
  Pick<ComponentProps<typeof AccountAvatar>, 'name'> &
  ComponentProps<typeof AccountMenu> &
  Pick<
    ComponentProps<typeof WorkspaceNavigation>,
    'onDeleteSection' | 'onCreateSection' | 'onUpdateSection' | 'showFeedback'
  >;

export const WorkspaceSwitcher: React.FC<DashboardSidebarProps> = ({
  name,
  email,
  onLogout,
  ...props
}) => {
  const [darkTheme, , setThemePreference] = useThemeFromStore();
  const [openMenu, setOpenMenu] = useState(false);
  const openUserSettings = useEditUserModalStore((state) => state.open);

  const ref = useActiveElement(() => {
    setOpenMenu(false);
  });

  const logoutAndCloseMenu = useCallback(() => {
    setOpenMenu(false);
    onLogout?.();
  }, [onLogout]);

  const openSettingsAndCloseMenu = useCallback(() => {
    setOpenMenu(false);
    openUserSettings();
  }, [openUserSettings]);

  const setDarkTheme = useCallback(
    (isDarkTheme: boolean) => {
      setThemePreference(isDarkTheme ? 'dark' : 'light');
    },
    [setThemePreference]
  );

  return (
    <div css={workspaceSwitcherStyles}>
      <div css={workspaceSwitcherFlexyStyles}>
        <WorkspaceSelector {...props}></WorkspaceSelector>
        <div css={themeSwitcherAndConfigStyles}>
          <div css={themeSwitcherStyles}>
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
                <div css={menuContainerStyles}>
                  <AccountMenu
                    name={name}
                    email={email}
                    onLogout={logoutAndCloseMenu}
                    onOpenSettings={openSettingsAndCloseMenu}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const menuContainerStyles = css({
  position: 'absolute',
  minWidth: '240px',
  width: 'max-content',
  maxWidth: '50vw',
  bottom: 20,
  left: '60px',
  zIndex: 2,
});

const themeSwitcherStyles = css({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: 32,
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

const workspaceSwitcherFlexyStyles = css({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const themeSwitcherAndConfigStyles = css({
  marginBottom: '22px',
  [smallScreenQuery]: {
    display: 'none',
    marginBottom: '0px',
  },
});
