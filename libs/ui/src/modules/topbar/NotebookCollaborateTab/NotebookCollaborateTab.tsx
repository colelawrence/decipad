/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { FC, useCallback, useState } from 'react';
import { Button, InputField } from '../../../shared';
import { Check, Loading } from '../../../icons';
import { CollabAccessDropdown } from '../CollabAccessDropdown/CollabAccessDropdown';
import { CollabMembersRights } from '../CollabMembersRights/CollabMembersRights';
import { cssVar, p14Medium, p14Regular } from '../../../primitives';
import { PermissionType } from '../../../types';
import { NotebookAccessActionsReturn } from '@decipad/interfaces';
import { UserAccessMetaFragment } from '@decipad/graphql-client';
import { isFlagEnabled } from '@decipad/feature-flags';
import { workspaces } from '@decipad/routing';
import { useNavigate } from 'react-router-dom';

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
  onInvite = () => Promise.resolve(),
  onRemove = () => Promise.resolve(),
  onChange = () => Promise.resolve(),
}: NotebookCollaborateTabProps): ReturnType<FC> => {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [permission, setPermission] = useState<PermissionType>('WRITE');

  const navigate = useNavigate();

  const isInvalidEmail = !email.includes('@') || email === session?.user?.email;

  const handleAddCollaborator = useCallback(() => {
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
  }, [loading, email, isInvalidEmail, onInvite, notebookId, permission]);

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

  const disabled = hasPaywall || !isAdmin;

  if (hasPaywall && isFlagEnabled('NEW_PAYMENTS')) {
    return (
      <div css={innerPopUpStyles}>
        <div css={titleStyles}>
          <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
            {isAdmin
              ? 'Invite people to collaborate'
              : 'Invitees of this notebook'}
          </p>
          <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
            To invite users to the notebook you must have a team or enterprise
            plan.
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
              />
            </span>
          </div>
          {hasPaywall ? (
            <Button
              size="extraSlim"
              type={'primary'}
              testId="upgrade-button"
              onClick={() => {
                if (workspaceId) {
                  navigate(
                    workspaces({})
                      .workspace({
                        workspaceId,
                      })
                      .members({}).$,
                    { replace: true }
                  );
                }
              }}
            >
              Upgrade to Pro to invite more people
            </Button>
          ) : (
            <Button
              size="extraSlim"
              type="tertiaryAlt"
              onClick={handleAddCollaborator}
              disabled={disabled}
              testId="send-invitation"
            >
              <div css={invitationButtonContentStyles}>
                {success && <CheckMark />}
                {loading && <LoadingDots />}
                Send invite
              </div>
            </Button>
          )}
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
      />
    </div>
  );
};
