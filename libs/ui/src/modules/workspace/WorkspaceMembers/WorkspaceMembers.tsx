/* eslint decipad/css-prop-named-variable: 2 */
import {
  UserAccessMetaFragment,
  useWorkspaceMembersState,
} from '@decipad/graphql-client';
import { css } from '@emotion/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  CollabMember,
  InputField,
  Loading,
  MenuItem,
  MenuList,
} from '../../../shared';
import { Check, Ellipsis } from '../../../icons';

import {
  cssVar,
  p12Medium,
  p12Regular,
  p13Medium,
  p14Medium,
  red500,
  componentCssVars,
} from '../../../primitives';
import { PermissionType } from '../../../types';
import { CollabMembershipDropdown } from '../../topbar/CollabMembershipDropdown/CollabMembershipDropdown';

export type WorkspaceMembersProps = {
  workspaceId: string;
  workspaceMembers: UserAccessMetaFragment[];
  currentUserId?: string;
};

const CheckMark = () => <Check width="16px" style={{ marginRight: '6px' }} />;
const LoadingDots = () => (
  <Loading width="24px" style={{ marginRight: '6px' }} />
);

export const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({
  workspaceId,
  workspaceMembers,
  currentUserId,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // TODO: fix input floating label
  const [permission, setPermission] = useState<PermissionType>('WRITE');
  const { invite, revoke, changePermission } = useWorkspaceMembersState();

  const handleRevoke = useCallback(
    (userId: string) => () => revoke(workspaceId, userId),
    [revoke, workspaceId]
  );

  const handleAddCollaborator = useCallback(async () => {
    setIsLoading(true);
    setSuccess(false);

    try {
      await invite(workspaceId, email, permission);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [email, invite, permission, workspaceId]);

  useEffect(() => {
    if (success) setEmail('');
  }, [success]);

  const handleChangePermission = useCallback(
    (userEmail?: string | null) => async (newPermission: PermissionType) => {
      if (!userEmail) {
        throw new Error('User email is not defined');
      }
      await changePermission(workspaceId, userEmail, newPermission);
    },
    [changePermission, workspaceId]
  );

  return (
    <div css={membersWrapperStyle}>
      <p css={pricingWrapper}>
        You will be charged for each editor or administrator added. Visit our{' '}
        <a css={pricingLink} href="https://www.decipad.com/pricing">
          pricing guide
        </a>{' '}
        for more information on how we bill.
      </p>
      <p css={inputLabelStyles}>Invite collaborators</p>
      <div css={invitationFormStyles}>
        <div css={inputContainerStyles}>
          <InputField
            type="email"
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

        {workspaceMembers.map((member) => {
          const inviteStatusStyles = columnInviteStatusStyles(true);
          return (
            member.user && (
              <React.Fragment key={member.user.id}>
                <div css={columnAvatarStyles}>
                  <CollabMember key={member.user.id} avatar={member} />
                </div>

                <div css={columnPermissionStyles}>
                  <CollabMembershipDropdown
                    disabled={currentUserId === member.user.id}
                    currentPermission={member.permission}
                    onChange={handleChangePermission(member.user.email)}
                  />
                </div>

                <div css={inviteStatusStyles}>
                  {currentUserId !== member.user.id && (
                    <span css={pendingInviteStyles}>invite pending</span>
                  )}
                  {currentUserId !== member.user.id && (
                    <WorkspaceMemberOptions
                      onRevoke={handleRevoke(member.user.id)}
                    />
                  )}
                </div>
              </React.Fragment>
            )
          );
        })}
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

const pricingWrapper = css(p12Regular, {
  backgroundColor: cssVar('backgroundDefault'),
  padding: '12px 16px',
  marginBottom: '8px',
  borderRadius: '8px',
  color: cssVar('textHeavy'),
});

const pricingLink = css({
  color: componentCssVars('LinkLighterColor'),
});

const inputLabelStyles = css(p12Medium, {
  marginBottom: '8px',
});

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

const columnInviteStatusStyles = (alignEnd: boolean) =>
  css({
    alignSelf: 'center',
    justifySelf: alignEnd ? 'flex-end' : 'flex-start',
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
  backgroundColor: cssVar('backgroundDefault'),
  padding: '4px 8px',
  display: 'inline-block',
  whiteSpace: 'nowrap',
});

const threeDotsButtonStyles = css(p12Medium, {
  cursor: 'pointer',
  borderRadius: '6px',
  padding: '4px 6px',
  display: 'inline-block',
  marginLeft: '8px',
  ':hover': {
    backgroundColor: cssVar('backgroundDefault'),
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

  input: {
    paddingRight: '112px',
  },
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
  whiteSpace: 'nowrap',
});

const tableHeadStyles = css(p13Medium, {
  color: cssVar('textDisabled'),
});

const sendInvitationButtonStyles = css({
  maxWidth: 'fit-content',
});

const revokeInviteButtonStyles = css(p14Medium, { color: red500.rgb });
