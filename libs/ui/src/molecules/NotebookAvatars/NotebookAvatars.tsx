import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import { cssVar, p12Regular, p13SemiBold, setCssVar } from '../../primitives';
import { PermissionType } from '../../types';

interface NotebookAvatar {
  user: {
    id: string;
    name: string;
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
  width: '24px',
  height: '24px',
  marginLeft: '-6px',
});

const tooltipNameStyles = css({
  ...p13SemiBold,
  marginBottom: '3px',
});

const tooltipRoleStyles = css({
  ...p12Regular,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

export interface NotebookAvatarsProps {
  usersWithAccess: NotebookAvatar[];
}

export const NotebookAvatars = ({
  usersWithAccess,
}: NotebookAvatarsProps): ReturnType<FC> => {
  return (
    <div css={avatarsWrapperStyles}>
      {usersWithAccess.map((avatar) => (
        <Tooltip
          key={avatar.user.id}
          trigger={
            <div css={avatarStyles}>
              <Avatar
                name={avatar.user.name}
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
      ))}
    </div>
  );
};
