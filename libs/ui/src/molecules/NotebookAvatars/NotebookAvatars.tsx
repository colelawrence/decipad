import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import { cssVar, p12Regular, p13Medium, setCssVar } from '../../primitives';
import { PermissionType } from '../../types';

interface NotebookAvatar {
  user: {
    id: string;
    name: string;
    email?: string | null;
  };
  permission: PermissionType;
}

const genRole = (permission: PermissionType) => {
  switch (permission) {
    case 'ADMIN':
      return 'Owner';
    case 'WRITE':
      return 'Can Edit';
    case 'READ':
      return 'View Only';
  }
};

const avatarsWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '6px',
});

const avatarStyles = css({
  width: '28px',
  height: '28px',
  marginLeft: '-6px',
});

const tooltipNameStyles = css({
  ...p13Medium,
  ...setCssVar('currentTextColor', cssVar('backgroundColor')),
  marginBottom: '3px',
});

const tooltipRoleStyles = css({
  ...p12Regular,
  ...setCssVar('currentTextColor', cssVar('highlightColor')),
});

export interface NotebookAvatarsProps {
  isWriter?: boolean;
  usersWithAccess?: NotebookAvatar[] | null;
}

export const NotebookAvatars = ({
  isWriter,
  usersWithAccess,
}: NotebookAvatarsProps): ReturnType<FC> => {
  return (
    <div css={avatarsWrapperStyles}>
      {usersWithAccess?.map((avatar, index) => {
        const email = avatar.user.email || avatar.user.name;
        return isWriter ? (
          <Tooltip
            key={index}
            trigger={
              <div css={avatarStyles}>
                <Avatar
                  name={avatar.user.name}
                  email={email}
                  greyedOut={avatar.permission !== 'ADMIN'}
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
              greyedOut={avatar.permission !== 'ADMIN'}
            />
          </div>
        );
      })}
    </div>
  );
};
