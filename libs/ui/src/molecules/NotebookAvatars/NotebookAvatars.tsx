/* eslint decipad/css-prop-named-variable: 0 */
import { cursorStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import {
  OpaqueColor,
  cssVar,
  p12Regular,
  p13Medium,
  setCssVar,
} from '../../primitives';
import { PermissionType } from '../../types';
import { Cursor, NotebookAvatar } from './NotebookAvatars.types';
import { sortAvatars } from './sortAvatars';

const genRole = (permission: PermissionType) => {
  switch (permission) {
    case 'ADMIN':
      return 'Author';
    case 'WRITE':
      return 'Collaborator';
    case 'READ':
      return 'Reader';
  }
};

const avatarsWrapperStyles = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  marginLeft: '8px',
  zIndex: 2,
});

const avatarStyles = css({
  width: '28px',
  height: '28px',
  marginLeft: '-8px',
  position: 'relative',
});

export const tooltipNameStyles = css({
  ...p13Medium,
  ...setCssVar('currentTextColor', cssVar('backgroundColor')),
  marginBottom: '3px',
});

const tooltipRoleStyles = css({
  ...p12Regular,
  ...setCssVar('currentTextColor', cssVar('highlightColor')),
});

export type NotebookAvatarsProps = {
  isWriter?: boolean;
  usersWithAccess?: NotebookAvatar[];
  usersFromTeam?: NotebookAvatar[];
  allUsers: NotebookAvatar[] | null;
  allowInvitation?: boolean;
  isPremiumWorkspace?: boolean;

  notebook?: { id: string; name: string; snapshots?: { createdAt?: string }[] };
  onInvite?: (email: string, permission: PermissionType) => Promise<void>;
  onChange?: (userId: string, permission: PermissionType) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
};

interface EmailLookup {
  [key: string]: OpaqueColor;
}

export const NotebookAvatars = ({
  isWriter,
  allUsers,
}: NotebookAvatarsProps): ReturnType<FC> => {
  const showHowMany = 3;
  const users = sortAvatars(allUsers || []);
  const firstThree = users.slice(0, showHowMany).reverse();
  const showPlus = users.length > showHowMany;
  const cursors = cursorStore.use.cursors();

  const backgroundColorFor = Object.entries(cursors)
    .filter(([cursorName]) => cursorName !== 'drag')
    .map(([, cursor]) => cursor)
    .reduce((previous: EmailLookup, current) => {
      const cursor = current as Cursor;
      const {
        data: { user, style },
      } = cursor;
      const { _backgroundColor } = style;
      const { email } = user;
      if (email && email !== '') {
        // eslint-disable-next-line no-param-reassign
        previous[email] = _backgroundColor;
      }
      return previous;
    }, {});

  return (
    <div data-testid="notebook-avatars" css={avatarsWrapperStyles}>
      {showPlus && (
        <div css={avatarStyles}>
          <Avatar name={`+${users.length - showHowMany}`} greyedOut={true} />
        </div>
      )}
      {firstThree?.map((avatar, index) => {
        const email = avatar.user.email || avatar.user.name;
        const cursorColor = backgroundColorFor[email] || null;
        return isWriter ? (
          <Tooltip
            key={index}
            hoverOnly
            side={'right'}
            trigger={
              <div css={avatarStyles}>
                <Avatar
                  name={avatar.user.name}
                  cursorColor={cursorColor}
                  email={email}
                  onClick={avatar.onClick}
                  useSecondLetter={false}
                />
              </div>
            }
          >
            <div css={{ textAlign: 'center' }}>
              <p css={tooltipNameStyles}>{avatar.user.name}</p>
              <p css={tooltipRoleStyles}>{genRole(avatar.permission)}</p>
            </div>
          </Tooltip>
        ) : (
          <div key={index} css={avatarStyles}>
            <Avatar
              name={avatar.user.name}
              email={email}
              useSecondLetter={false}
            />
          </div>
        );
      })}
    </div>
  );
};
