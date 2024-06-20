/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Button, InputField, Loading } from '../../../shared';
import { Check } from '../../../icons';
import { CollabAccessDropdown } from '../CollabAccessDropdown/CollabAccessDropdown';
import { CollabMembersRights } from '../CollabMembersRights/CollabMembersRights';
import { cssVar, p10Medium, p14Medium, p14Regular } from '../../../primitives';
import { PermissionType } from '../../../types';
import { NotebookAccessActionsReturn } from '@decipad/interfaces';
import { UserAccessMetaFragment } from '@decipad/graphql-client';
import { workspaces } from '@decipad/routing';
import { useNavigate } from 'react-router-dom';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';

/**
 * The styles for the content rendered without the need for the toggle to be activated. This is also the parent of the toggle component.
 */
const innerPopUpStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
});

const titleStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const invitationButtonContentStyles = css({
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const inputContainerStyles = css({
  position: 'relative',
  height: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',

  'div:first-of-type': {
    height: '100%',
  },

  input: {
    border: 0,
  },
});

const invitationFormStyles = css({
  gap: '8px',
  display: 'flex',
  flexDirection: 'column',
  input: {
    paddingTop: '5px',
    paddingBottom: '5px',
    fontSize: '13px',
    lineHeight: '100%',
    width: '100%',
  },
});

const upgradeButtonStyles = css(p10Medium, {
  flexGrow: '0',
  alignSelf: 'baseline',
});

const CheckMark = () => <Check width="16px" style={{ marginRight: '6px' }} />;
const LoadingDots = () => (
  <Loading width="24px" style={{ marginRight: '6px' }} />
);

interface NotebookCollaborateTabProps {
  readonly hasPaywall?: boolean;
  readonly workspaceId: string;
  readonly isAdmin: boolean;
  readonly usersWithAccess?: UserAccessMetaFragment[] | null;
  readonly nrOfTeamMembers?: number | null;
  readonly manageTeamURL?: string;
  readonly teamName?: string;
  readonly canInviteEditors?: boolean;
  readonly canInviteReaders?: boolean;

  readonly notebookId: string;
  readonly onRemove: NotebookAccessActionsReturn['onRemoveAccess'];
  readonly onInvite: NotebookAccessActionsReturn['onInviteByEmail'];
  readonly onChange: NotebookAccessActionsReturn['onChangeAccess'];
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookCollaborateTab = ({
  hasPaywall,
  workspaceId,
  usersWithAccess,
  teamName,
  nrOfTeamMembers = 0,
  manageTeamURL,
  isAdmin,
  notebookId,
  canInviteEditors,
  canInviteReaders,
  onInvite = () => Promise.resolve(),
  onRemove = () => Promise.resolve(),
  onChange = () => Promise.resolve(),
}: NotebookCollaborateTabProps): ReturnType<FC> => {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [permission, setPermission] = useState<PermissionType>('WRITE');
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  useEffect(() => {
    if (!canInviteEditors && permission === 'WRITE') {
      setPermission('READ');
    }
  }, [canInviteEditors, permission]);

  const navigate = useNavigate();

  const isInvalidEmail = !email.includes('@') || email === session?.user?.email;

  const handleAddCollaborator = useCallback(() => {
    if (hasPaywall && workspaceId) {
      navigate(
        workspaces({})
          .workspace({
            workspaceId,
          })
          .members({}).$,
        { replace: true }
      );
      return;
    }
    if (loading) return;
    if (!email) return;
    if (isInvalidEmail) return;

    setIsLoading(true);
    setEmail('');
    onInvite(notebookId, email, permission).finally(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    });
  }, [
    loading,
    email,
    isInvalidEmail,
    hasPaywall,
    workspaceId,
    onInvite,
    notebookId,
    permission,
    navigate,
  ]);

  const handleRemoveCollaborator = useCallback(
    (userId: string) => {
      if (loading) return;
      setIsLoading(true);
      onRemove(notebookId, userId).finally(() => setIsLoading(false));
    },
    [loading, notebookId, onRemove]
  );

  const handleChangePermission = useCallback(
    (userId: string, perm: PermissionType) => {
      if (loading) return;
      setIsLoading(true);
      onChange(notebookId, userId, perm).finally(() => setIsLoading(false));
    },
    [loading, notebookId, onChange]
  );

  if (hasPaywall) {
    return (
      <div css={innerPopUpStyles}>
        <div css={titleStyles}>
          <div css={{ display: 'flex', justifyContent: 'space-between' }}>
            <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
              {isAdmin
                ? 'Invite people to collaborate'
                : 'Invitees of this notebook'}
            </p>
            <Button
              type="tagBrand"
              size="tag"
              onClick={() => setIsUpgradeWorkspaceModalOpen(true)}
              styles={upgradeButtonStyles}
            >
              Upgrade
            </Button>
          </div>
          <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
            To invite more users to the notebook you must upgrade plan.
          </p>
        </div>

        <CollabMembersRights
          usersWithAccess={usersWithAccess}
          teamName={teamName}
          manageTeamURL={manageTeamURL}
          nrOfTeamMembers={nrOfTeamMembers}
          onRemoveCollaborator={handleRemoveCollaborator}
          onChangePermission={handleChangePermission}
          disabled={!isAdmin}
          canInviteReaders={canInviteReaders}
          canInviteEditors={canInviteEditors}
          hasPaywall={hasPaywall}
        />
      </div>
    );
  }

  return (
    <div css={innerPopUpStyles}>
      <div css={titleStyles}>
        <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
          {isAdmin
            ? 'Invite people to collaborate'
            : 'Invitees of this notebook'}
        </p>
        <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
          {isAdmin
            ? 'Invited users will receive an email to the provided email address'
            : 'Request access to have more sharing options'}
        </p>
      </div>

      {isAdmin && (
        <div css={invitationFormStyles}>
          <div css={inputContainerStyles}>
            <InputField
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={setEmail}
              onEnter={handleAddCollaborator}
            />
            <span data-testid="select-share-permission">
              <CollabAccessDropdown
                isInvitationPicker
                currentPermission={permission}
                onChange={setPermission}
                canInviteEditors={canInviteEditors}
                canInviteReaders={canInviteReaders}
              />
            </span>
          </div>
          <Button
            size="extraSlim"
            type={hasPaywall ? 'primary' : 'tertiaryAlt'}
            disabled={!isAdmin}
            testId={hasPaywall ? 'upgrade-button' : 'send-invitation'}
            onClick={handleAddCollaborator}
          >
            {hasPaywall ? (
              'Upgrade to invite more people'
            ) : (
              <div css={invitationButtonContentStyles}>
                {success && <CheckMark />}
                {loading && <LoadingDots />}
                Send invite
              </div>
            )}
          </Button>
        </div>
      )}

      <CollabMembersRights
        usersWithAccess={usersWithAccess}
        teamName={teamName}
        manageTeamURL={manageTeamURL}
        nrOfTeamMembers={nrOfTeamMembers}
        onRemoveCollaborator={handleRemoveCollaborator}
        onChangePermission={handleChangePermission}
        disabled={!isAdmin}
        canInviteReaders={canInviteReaders}
        canInviteEditors={canInviteEditors}
      />
    </div>
  );
};
