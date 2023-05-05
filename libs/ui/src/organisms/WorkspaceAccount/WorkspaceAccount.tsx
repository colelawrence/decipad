import { useAuthenticationState } from '@decipad/graphql-client';
import { useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { useActiveElement } from '@decipad/react-utils';
import { CollabMember } from '../../atoms';
import { AccountMenu } from '../AccountMenu/AccountMenu';
import { useEditUserModalStore } from '../../templates/EditUserModal/EditUserModal';
import { cssVar } from '../../primitives';

export const WorkspaceAccount: React.FC = () => {
  const authState = useAuthenticationState();

  const [openMenu, setOpenMenu] = useState(false);
  const openUserSettings = useEditUserModalStore((state) => state.open);

  const setMenuOpen = useCallback(
    () => setOpenMenu(!openMenu),
    [openMenu, setOpenMenu]
  );

  const ref = useActiveElement(() => {
    setOpenMenu(false);
  });

  const openSettingsAndCloseMenu = useCallback(() => {
    setOpenMenu(false);
    openUserSettings();
  }, [openUserSettings]);

  const { signOutCallback } = authState;

  const logoutAndCloseMenu = useCallback(() => {
    setOpenMenu(false);
    signOutCallback();
  }, [signOutCallback]);

  return (
    <div
      css={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        cursor: 'pointer',

        padding: '4px 6px',
        borderRadius: '8px',

        ':hover': {
          backgroundColor: cssVar('highlightColor'),
        },
      }}
      ref={ref}
      onClick={setMenuOpen}
    >
      <CollabMember
        avatar={{
          user: authState.currentUser,
          permission: 'READ',
        }}
      />
      {openMenu && (
        <div css={menuContainerStyles}>
          <AccountMenu
            onLogout={logoutAndCloseMenu}
            onOpenSettings={openSettingsAndCloseMenu}
            name={authState.currentUser.name}
            email={authState.currentUser.email}
          />
        </div>
      )}
    </div>
  );
};

const menuContainerStyles = css({
  position: 'absolute',
  minWidth: '240px',
  width: 'max-content',
  maxWidth: '50vw',
  bottom: 20,
  left: '128px',
  zIndex: 2,
  cursor: 'default',
});
