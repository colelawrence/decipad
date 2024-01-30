/* eslint-disable no-param-reassign */
/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { PermissionType } from '../../../types';
import { CollabMemberOrTeam } from './CollabMemberOrTeam';
import { UserAccessMetaFragment } from '@decipad/graphql-client';

type CollabMembersRightsProps = {
  readonly usersWithAccess?: UserAccessMetaFragment[] | null;
  readonly nrOfTeamMembers?: number | null;
  readonly teamName?: string;
  readonly manageTeamURL?: string;
  readonly onRemoveCollaborator?: (userId: string) => void;
  readonly onChangePermission?: (
    userId: string,
    permission: PermissionType
  ) => void;
  readonly disabled: boolean;
};

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const CollabMembersRights: FC<CollabMembersRightsProps> = ({
  usersWithAccess,
  teamName,
  nrOfTeamMembers = 0,
  manageTeamURL,
  onRemoveCollaborator = noop,
  onChangePermission = noop,
  disabled = false,
}) => {
  if (nrOfTeamMembers == null) {
    nrOfTeamMembers = 0;
  }
  if (!usersWithAccess?.length) {
    return null;
  }

  const sortedUsersWithAccess = usersWithAccess.sort((a, b) => {
    return a.user && b.user ? a.user.name.localeCompare(b.user.name) : 0;
  });

  return sortedUsersWithAccess.length > 0 ||
    (teamName && nrOfTeamMembers > 1) ? (
    <>
      <div css={[groupStyles]}>
        {sortedUsersWithAccess.map((info) =>
          info.user ? (
            <CollabMemberOrTeam
              key={info.user.id}
              info={info}
              disabled={disabled}
              onRemoveCollaborator={onRemoveCollaborator}
              onChangePermission={onChangePermission}
            />
          ) : null
        )}

        {teamName &&
          nrOfTeamMembers > 1 && ( // dont show unless theres at least two people
            <CollabMemberOrTeam
              teamName={teamName}
              disabled={disabled}
              teamMembers={nrOfTeamMembers}
              manageTeamURL={manageTeamURL}
            />
          )}
      </div>
    </>
  ) : null;
};
