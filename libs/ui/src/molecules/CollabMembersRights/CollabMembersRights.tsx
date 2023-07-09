/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { CollabAccessDropdown, NotebookAvatar } from '..';
import { Avatar } from '../../atoms';
import { ellipsis, p12Medium, p14Medium } from '../../primitives';
import { PermissionType } from '../../types';

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
        {sortedUsersWithAccess.map(({ user, permission, isTeamMember }) => (
          <div css={collaboratorStyles} key={user.id}>
            <div css={avatarStyles}>
              <Avatar
                name={user.name}
                email={user.email || ''}
                useSecondLetter={false}
              />
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
              disable={isTeamMember}
              currentPermission={permission}
              isActivatedAccount={user.name !== user.email}
              onRemove={() => onRemoveCollaborator(user.id)}
              onChange={(newPerm) => onChangePermission(user.id, newPerm)}
            />
          </div>
        ))}
      </div>
    </>
  );
};
