import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { noop } from 'lodash';
import { FC, useCallback, useState } from 'react';
import { Avatar, Tooltip } from '../../atoms';
import { PermissionType } from '../../types';
import { NotebookInvitationPopUp } from '../../organisms';
import { cssVar, p12Regular, p13Medium, setCssVar } from '../../primitives';

export interface NotebookAvatar {
  user: {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    onboarded?: boolean | null;
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
  zIndex: 2,
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

export type NotebookAvatarsProps = {
  isWriter?: boolean;
  usersWithAccess?: NotebookAvatar[] | null;
  allowInvitation?: boolean;

  notebook: { id: string; name: string; snapshots?: { createdAt?: string }[] };
  onInvite?: (email: string) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
};

export const NotebookAvatars = ({
  isWriter,
  usersWithAccess,
  allowInvitation,
  ...sharingProps
}: NotebookAvatarsProps): ReturnType<FC> => {
  const [showInvitePopup, setShowInvitePopup] = useState<boolean>(false);

  const toggleInvitePopup = useCallback(() => {
    setShowInvitePopup((show) => !show);
  }, [setShowInvitePopup]);

  const handleClickOutside = useCallback(
    (ev: MouseEvent) => {
      const target = ev.target as HTMLElement;
      const isAvatarClick = target.closest('.notebook-avatars');
      const isPopupClick = target.closest('.notebook-invitation-popup');

      const isHtmlClick = target.tagName === 'HTML';
      const isPopoverClick = target.closest(
        '[data-radix-popper-content-wrapper]'
      );

      if (!isAvatarClick && !isPopupClick && !isPopoverClick && !isHtmlClick) {
        setShowInvitePopup(false);
      }
    },
    [setShowInvitePopup]
  );

  useWindowListener('click', showInvitePopup ? handleClickOutside : noop);

  const nonAdminUsers = usersWithAccess?.filter(
    (user) => user.permission !== 'ADMIN'
  );

  return (
    <div css={avatarsWrapperStyles} className="notebook-avatars">
      {allowInvitation && (
        <Tooltip
          trigger={
            <div
              key="invite"
              css={plusAvatarStyles}
              onClick={toggleInvitePopup}
              data-testid="avatar-invite"
            >
              <Avatar name={showInvitePopup ? '×' : '+'} greyedOut={true} />
            </div>
          }
          open={showInvitePopup ? false : undefined}
        >
          <div css={{ textAlign: 'center' }}>
            <p css={tooltipNameStyles}>Click to invite others</p>
          </div>
        </Tooltip>
      )}
      {usersWithAccess?.map((avatar, index) => {
        const email = avatar.user.email || avatar.user.name;
        const isActiveUser = avatar.user.onboarded;
        const isOwner = avatar.permission === 'ADMIN';

        if (!isActiveUser && !isOwner) return null;

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
        <div className="notebook-invitation-popup" css={popupWrapperStyles}>
          <NotebookInvitationPopUp
            usersWithAccess={nonAdminUsers}
            {...sharingProps}
          />
        </div>
      )}
    </div>
  );
};
