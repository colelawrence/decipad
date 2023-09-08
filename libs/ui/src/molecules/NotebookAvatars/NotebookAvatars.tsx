/* eslint decipad/css-prop-named-variable: 0 */
import { cursorStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import {
  OpaqueColor,
  componentCssVars,
  p12Regular,
  p13Medium,
} from '../../primitives';
import { PermissionType } from '../../types';
import { Cursor } from './NotebookAvatars.types';
import { sortAvatars } from './sortAvatars';
import { UserAccessMetaFragment } from '@decipad/graphql-client';

const genRole = (permission: PermissionType) => {
  switch (permission) {
    case 'ADMIN':
      return 'author';
    case 'WRITE':
      return 'collaborator';
    case 'READ':
      return 'reader';
  }
};

const avatarsWrapperStyles = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row-reverse',
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

export const tooltipNameStyles = css(p13Medium, {
  marginBottom: '3px',
  color: componentCssVars('TooltipText'),
});

const tooltipRoleStyles = css(p12Regular, {
  color: componentCssVars('TooltipText'),
});

export type NotebookAvatarsProps = {
  readonly isWriter?: boolean;
  readonly usersWithAccess?: UserAccessMetaFragment[];
  readonly usersFromTeam?: UserAccessMetaFragment[];
  readonly invitedUsers: UserAccessMetaFragment[] | null;
  readonly teamUsers?: UserAccessMetaFragment[] | null;
  readonly teamName?: string;
  readonly allowInvitation?: boolean;
  readonly isPremiumWorkspace?: boolean;
};

interface EmailLookup {
  [key: string]: OpaqueColor;
}

export const NotebookAvatars = ({
  isWriter,
  invitedUsers,
}: NotebookAvatarsProps): ReturnType<FC> => {
  const showHowMany = 3;
  const users = sortAvatars(invitedUsers || []);
  const firstThree = users.slice(0, showHowMany);
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
      {firstThree?.map((avatar, index) => {
        if (!avatar.user) {
          return null;
        }
        const {
          user: { email, image, name },
        } = avatar;
        const cursorColor = backgroundColorFor[email || name] || null;
        return isWriter ? (
          <Tooltip
            key={index}
            hoverOnly
            side={'right'}
            trigger={
              <div css={avatarStyles}>
                <Avatar
                  name={name}
                  cursorColor={cursorColor}
                  useSecondLetter={false}
                  imageHash={image}
                />
              </div>
            }
          >
            <div css={{ textAlign: 'center' }}>
              <p css={tooltipNameStyles}>{name}</p>
              <p css={tooltipRoleStyles}>{genRole(avatar.permission)}</p>
            </div>
          </Tooltip>
        ) : (
          <div key={index} css={avatarStyles}>
            <Avatar name={name} useSecondLetter={false} imageHash={image} />
          </div>
        );
      })}
      {showPlus && (
        <div css={avatarStyles}>
          <Avatar name={`+${users.length - showHowMany}`} greyedOut={true} />
        </div>
      )}
    </div>
  );
};
