import { useAuthenticationState } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { CollabMember } from '../../atoms';
import { useEditUserModalStore } from '../../templates/EditUserModal/EditUserModal';
import { cssVar } from '../../primitives';
import { Settings } from '../../icons';

export const WorkspaceAccount: React.FC = () => {
  const authState = useAuthenticationState();
  const openUserSettings = useEditUserModalStore((state) => state.open);

  return (
    <div css={buttonsContainerStyles}>
      <div
        css={accountButtonStyles}
        onClick={openUserSettings}
        data-testid="account-settings-button"
      >
        <CollabMember
          avatar={{
            user: authState.currentUser,
            permission: 'READ',
          }}
        />

        <div css={settingsButtonStyles} onClick={openUserSettings}>
          <Settings />
        </div>
      </div>
    </div>
  );
};

const buttonsContainerStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
});

const accountButtonStyles = css({
  flex: 1,
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  cursor: 'pointer',

  padding: '4px 6px',
  borderRadius: '8px',

  ':hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },
});

const settingsButtonStyles = css({
  height: '28px',
  width: '28px',
  borderRadius: '8px',
  padding: '6px',
  backgroundColor: cssVar('backgroundDefault'),

  cursor: 'pointer',
  opacity: 0.5,
});
