/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import md5 from 'md5';
import { FC } from 'react';
import { CollabAccessDropdown } from '..';
import { Avatar, TextAndIconButton } from '../../atoms';
import { ellipsis, p12Medium, p14Medium } from '../../primitives';
import { PermissionType } from '../../types';
import { UserAccessMetaFragment } from '@decipad/graphql-client';

type CollabMemberUserProps = {
  readonly info: UserAccessMetaFragment;
  readonly onRemoveCollaborator?: (userId: string) => void;
  readonly onChangePermission?: (
    userId: string,
    permission: PermissionType
  ) => void;
  readonly disabled: boolean;
};

type CollabMemberTeamProps = {
  readonly teamName: string;
  readonly manageTeamURL?: string;
  readonly teamMembers: number;
  readonly disabled: boolean;
};

// Union type for both component types
type CollabMemberOrTeamProps = CollabMemberUserProps | CollabMemberTeamProps;

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

export const CollabMemberOrTeam: FC<CollabMemberOrTeamProps> = (props) => {
  if ('info' in props) {
    const {
      info,
      onRemoveCollaborator = noop,
      onChangePermission = noop,
      disabled = false,
    } = props;
    const { user, permission } = info;
    const { name, id, email, image } = user || {};

    return (
      <div css={collaboratorStyles} key={id} data-testid={`sharing-list:${id}`}>
        <div css={avatarStyles}>
          <Avatar name={name || ''} imageHash={image} useSecondLetter={false} />
        </div>
        {email === name ? (
          <div css={userDetailsStyles}>
            <div css={css(p14Medium, ellipsis)} title={email ?? undefined}>
              {email}
            </div>
          </div>
        ) : (
          <div css={userDetailsStyles}>
            <div css={css(p14Medium, ellipsis)} title={name}>
              {name}
            </div>
            <div css={css(p12Medium, ellipsis)} title={email ?? undefined}>
              {email}
            </div>
          </div>
        )}

        {/* Define isTeamMember and permission based on your logic */}
        {/* Replace 'isTeamMember' and 'permission' with actual variables */}
        <CollabAccessDropdown
          disable={disabled}
          currentPermission={permission}
          onRemove={() => (user?.id ? onRemoveCollaborator(user.id) : noop)}
          onChange={(newPerm) =>
            user?.id ? onChangePermission(user.id, newPerm) : noop
          }
        />
      </div>
    );
  }
  const { teamName, manageTeamURL, teamMembers, disabled } = props;
  // just in case someone use's an email as workspace name
  const teamNameHash = md5(teamName, { encoding: 'binary' });

  return (
    <div css={collaboratorStyles}>
      <div css={avatarStyles}>
        <Avatar
          name={teamName}
          imageHash={teamNameHash}
          useSecondLetter={false}
        />
      </div>

      <div css={userDetailsStyles}>
        <div css={css(p14Medium, ellipsis)}>{teamName}</div>
        <div css={css(p12Medium, ellipsis)}>
          {teamMembers} member{teamMembers > 1 && 's'}
        </div>
      </div>

      {!disabled && (
        <TextAndIconButton
          text={'team'}
          href={manageTeamURL}
          color={'default'}
        />
      )}
    </div>
  );
};
