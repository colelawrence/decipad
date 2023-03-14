import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { noop } from 'lodash';
import { useIntercom } from 'react-use-intercom';
import { Avatar } from '../../atoms';
import {
  cssVar,
  ellipsis,
  p12Medium,
  p13Regular,
  p14Medium,
  setCssVar,
} from '../../primitives';
import { CollabAccessDropdown } from '..';
import { NotebookAvatar } from '../NotebookAvatars/NotebookAvatars';
import { PermissionType } from '../../types';
import { Sparkles } from '../../icons';

type CollabMembersRightsProps = {
  usersWithAccess?: NotebookAvatar[] | null;
  onRemoveCollaborator?: (userId: string) => void;
  onChangePermission?: (userId: string, permission: PermissionType) => void;
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

const userDetailsStyles = css({
  flex: 1,
  minWidth: 0,
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

const disclaimerStyles = css(p13Regular, {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '8px',
  gap: '8px',

  backgroundColor: cssVar('strongHighlightColor'),
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),

  borderRadius: '8px',
});

const Disclaimer = () => {
  const { show, showNewMessage } = useIntercom();

  const showFeedback = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      show();
      showNewMessage();
    },
    [show, showNewMessage]
  );

  return (
    <p css={disclaimerStyles}>
      <div css={{ height: '18px', width: '18px', flexShrink: 0 }}>
        <Sparkles />
      </div>
      <span>
        We're testing collaboration!{' '}
        <button onClick={showFeedback} css={{ textDecoration: 'underline' }}>
          Let us know
        </button>
        , if something doesn't work as expected.
      </span>
    </p>
  );
};

export const CollabMembersRights: FC<CollabMembersRightsProps> = ({
  usersWithAccess,
  onRemoveCollaborator = noop,
  onChangePermission = noop,
}) => {
  if (!usersWithAccess?.length) {
    return null;
  }

  const sortedUsersWithAccess = usersWithAccess.sort((a, b) => {
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <>
      <div css={titleAndToggleStyles}>
        <p css={css(p14Medium)}>List of collaborators</p>
      </div>

      <div css={groupStyles}>
        {sortedUsersWithAccess.map(({ user, permission }) => (
          <div css={collaboratorStyles} key={user.id}>
            <div css={avatarStyles}>
              <Avatar name={user.name} email={user.email || ''} />
            </div>
            {user.email === user.name ? (
              <div css={userDetailsStyles}>
                <div
                  css={css(p12Medium, ellipsis)}
                  title={user.email ?? undefined}
                >
                  {user.email}
                </div>
              </div>
            ) : (
              <div css={userDetailsStyles}>
                <div css={css(p14Medium, ellipsis)} title={user.name}>
                  {user.name}
                </div>
                <div
                  css={css(p12Medium, ellipsis)}
                  title={user.email ?? undefined}
                >
                  {user.email}
                </div>
              </div>
            )}

            <CollabAccessDropdown
              currentPermission={permission}
              isActivatedAccount={!!user.onboarded}
              onRemove={() => onRemoveCollaborator(user.id)}
              onChange={(newPerm) => onChangePermission(user.id, newPerm)}
            />
          </div>
        ))}
      </div>

      <Disclaimer />
    </>
  );
};
