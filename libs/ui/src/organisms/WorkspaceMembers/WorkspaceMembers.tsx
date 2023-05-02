/* eslint decipad/css-prop-named-variable: 2 */
import { css } from '@emotion/react';
import React, { useCallback, useEffect, useState } from 'react';
import { PermissionType } from '../../types';
import { Check, Ellipsis, Loading } from '../../icons';
import {
  CollabMembershipDropdown,
  MenuList,
  NotebookAvatar,
} from '../../molecules';
import { Button, CollabMember, InputField, MenuItem } from '../../atoms';
import {
  cssVar,
  p12Medium,
  p13Medium,
  p14Medium,
  red500,
} from '../../primitives';

export type WorkspaceMembersProps = {
  workspaceId: string;
  workspaceMembers: NotebookAvatar[];
  currentUserId?: string;
  onInvite: (
    workspaceId: string,
    email: string,
    permission: PermissionType
  ) => Promise<void>;
  onRevoke: (workspaceId: string, userId: string) => Promise<void>;
  onPermissionChange: (
    workspaceId: string,
    userId: string,
    email: string,
    permission: PermissionType
  ) => Promise<void>;
};

const CheckMark = () => <Check width="16px" style={{ marginRight: '6px' }} />;
const LoadingDots = () => (
  <Loading width="24px" style={{ marginRight: '6px' }} />
);

export const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({
  onInvite,
  onRevoke,
  onPermissionChange,
  workspaceId,
  workspaceMembers,
  currentUserId,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // TODO: fix input floating label
  const [permission, setPermission] = useState<PermissionType>('WRITE');

  const handleAddCollaborator = useCallback(async () => {
    setIsLoading(true);
    setSuccess(false);

    try {
      await onInvite(workspaceId, email, permission);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [email, onInvite, permission, workspaceId]);

  useEffect(() => {
    if (success) setEmail('');
  }, [success]);

  return (
    <div css={membersWrapperStyle}>
      <div css={invitationFormStyles}>
        <div css={inputContainerStyles}>
          <InputField
            placeholder="Enter email address"
            value={email}
            onChange={setEmail}
            onEnter={handleAddCollaborator}
          />

          <span css={inputAccessPickerStyles}>
            <CollabMembershipDropdown
              isInvitationPicker
              currentPermission={permission}
              onChange={setPermission}
            />
          </span>
        </div>

        <div css={sendInvitationButtonStyles}>
          <Button
            size="extraSlim"
            testId="send-invitation"
            onClick={handleAddCollaborator}
          >
            <div css={invitationButtonContentStyles}>
              {success && <CheckMark />}
              {loading && <LoadingDots />}
              Send invitation
            </div>
          </Button>
        </div>
      </div>

      <div css={membersTableStyles}>
        <div css={tableHeadStyles}>User</div>
        <div css={tableHeadStyles}>Access level</div>
        <div css={tableHeadStyles}>Status</div>

        {workspaceMembers.map((member) => (
          <React.Fragment key={member.user.id}>
            <div css={columnAvatarStyles}>
              <CollabMember key={member.user.id} avatar={member} />
            </div>

            <div css={columnPermissionStyles}>
              <CollabMembershipDropdown
                disabled={currentUserId === member.user.id}
                currentPermission={member.permission}
                onChange={(newPermission) => {
                  if (!member.user.email) {
                    throw new Error('User email is not defined');
                  }

                  onPermissionChange(
                    workspaceId,
                    member.user.id,
                    member.user.email,
                    newPermission
                  );
                }}
              />
            </div>

            <div css={columnInviteStatusStyles}>
              {/* TODO: use member.user.onboarded */}
              {member.user.name === member.user.email && (
                <span css={pendingInviteStyles}>invite pending</span>
              )}
              {currentUserId !== member.user.id && (
                <WorkspaceMemberOptions
                  onRevoke={() => onRevoke(workspaceId, member.user.id)}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const WorkspaceMemberOptions: React.FC<{ onRevoke(): void }> = ({
  onRevoke,
}) => (
  <MenuList
    root
    dropdown
    align="end"
    sideOffset={4}
    trigger={
      <span css={threeDotsButtonStyles}>
        <span css={ellipsisIconStyles}>
          <Ellipsis />
        </span>
      </span>
    }
  >
    <MenuItem onSelect={onRevoke}>
      <p css={revokeInviteButtonStyles}>Revoke invite</p>
    </MenuItem>
  </MenuList>
);

const membersWrapperStyle = css({
  marginBottom: '42px',
});

const columnAvatarStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
});

const columnPermissionStyles = css({
  alignSelf: 'center',
});

const columnInviteStatusStyles = css({
  alignSelf: 'center',
  justifySelf: 'flex-end',
});

const membersTableStyles = css({
  margin: '16px 0',
  marginTop: '24px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr fit-content(18ch)',
  gap: '16px',
});

const pendingInviteStyles = css(p12Medium, {
  borderRadius: '6px',
  backgroundColor: cssVar('highlightColor'),
  padding: '4px 8px',
  display: 'inline-block',
});

const threeDotsButtonStyles = css(p12Medium, {
  cursor: 'pointer',
  borderRadius: '6px',
  padding: '4px 6px',
  display: 'inline-block',
  marginLeft: '8px',
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
  },
});

const ellipsisIconStyles = css({
  display: 'inline-block',
  height: '14px',
  width: '14px',
  verticalAlign: 'middle',
  svg: { height: '100%', width: '100%' },
});

const inputContainerStyles = css({
  position: 'relative',
  flexGrow: 1,
});

const inputAccessPickerStyles = css({
  position: 'absolute',
  right: '2px',
  bottom: 0,
  top: 0,
  marginTop: 'auto',
  marginBottom: 'auto',
  height: 'fit-content',
});

const invitationFormStyles = css({
  gap: '8px',
  display: 'flex',
  flexDirection: 'row',
  input: {
    paddingTop: '7px',
    paddingBottom: '7px',
    fontSize: '13px',
    lineHeight: '100%',
    width: '100%',
  },
});

const invitationButtonContentStyles = css({
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const tableHeadStyles = css(p13Medium, {
  color: cssVar('weakerTextColor'),
});

const sendInvitationButtonStyles = css({
  maxWidth: 'fit-content',
});

const revokeInviteButtonStyles = css({ ...p14Medium, color: red500.rgb });
