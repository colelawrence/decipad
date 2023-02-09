import { css } from '@emotion/react';
import { FC } from 'react';
import { noop } from 'lodash';
import { Avatar } from '../../atoms';
import { p12Medium, p14Medium } from '../../primitives';
import { CollabAccessDropdown } from '..';
import { NotebookAvatar } from '../NotebookAvatars/NotebookAvatars';

type CollabMembersRightsProps = {
  usersWithAccess?: NotebookAvatar[] | null;
  onRemoveCollaborator?: (userId: string) => void;
};

const collaboratorStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
});

const avatarStyles = css({
  width: '28px',
  height: '28px',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const horizontalGroupStyles = css(groupStyles, { flexDirection: 'row' });

const titleAndToggleStyles = css(horizontalGroupStyles, {
  justifyContent: 'space-between',
});

export const CollabMembersRights: FC<CollabMembersRightsProps> = ({
  usersWithAccess,
  onRemoveCollaborator = noop,
}) => {
  if (!usersWithAccess?.length) {
    return null;
  }

  return (
    <>
      <div css={titleAndToggleStyles}>
        <p css={css(p14Medium)}>List of collaborators</p>
      </div>

      <div css={groupStyles}>
        {usersWithAccess.map(({ user, permission }) => (
          <div css={collaboratorStyles} key={user.id}>
            <div css={avatarStyles}>
              <Avatar name={user.name} email={user.email || ''} />
            </div>
            {user.email === user.name ? (
              <div css={{ flex: 1 }}>
                <div css={css(p12Medium)}>{user.email}</div>
              </div>
            ) : (
              <div css={{ flex: 1 }}>
                <div css={css(p14Medium)}>{user.name}</div>
                <div css={css(p12Medium)}>{user.email}</div>
              </div>
            )}

            <CollabAccessDropdown
              currentPermission={permission}
              isActivatedAccount={!!user.onboarded}
              onRemove={() => onRemoveCollaborator(user.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
};
