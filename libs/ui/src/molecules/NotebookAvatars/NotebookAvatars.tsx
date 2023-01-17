import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useState } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import { NotebookInvitationPopUp } from '../../organisms';
import { cssVar, p12Regular, p13Medium, setCssVar } from '../../primitives';
import { PermissionType } from '../../types';

interface NotebookAvatar {
  user: {
    id: string;
    name: string;
    email?: string | null;
  };
  permission: PermissionType;
  onClick?: () => void;
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
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  marginLeft: '6px',
});

const popupWrapperStyles = css({
  position: 'absolute',
  top: '42px',
  right: '-88px',
});

const avatarStyles = css({
  width: '28px',
  height: '28px',
  marginLeft: '-6px',
});

const plusAvatarStyles = css(avatarStyles, {
  cursor: 'pointer',
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

export type NotebookAvatarsProps = ComponentProps<
  typeof NotebookInvitationPopUp
> & {
  isWriter?: boolean;
  usersWithAccess?: NotebookAvatar[] | null;
  allowInvitation?: boolean;
};

export const NotebookAvatars = ({
  isWriter,
  usersWithAccess,
  allowInvitation,
  ...sharingProps
}: NotebookAvatarsProps): ReturnType<FC> => {
  const [showInvitePopup, setShowInvitePopup] = useState<boolean>(false);

  const handleClickOutside = () => {
    setShowInvitePopup(false);
  };
  useWindowListener('click', handleClickOutside);

  return (
    <div css={avatarsWrapperStyles} onClick={(e) => e.stopPropagation()}>
      {allowInvitation && (
        <div
          key="invite"
          css={plusAvatarStyles}
          onClick={() => setShowInvitePopup((show) => !show)}
        >
          <Avatar name={showInvitePopup ? '×' : '+'} greyedOut={true} />
        </div>
      )}
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
                  onClick={avatar.onClick}
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
      {showInvitePopup && (
        <div css={popupWrapperStyles}>
          <NotebookInvitationPopUp {...sharingProps} />
        </div>
      )}
    </div>
  );
};
