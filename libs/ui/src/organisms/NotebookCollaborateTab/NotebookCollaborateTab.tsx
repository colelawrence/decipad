/* eslint decipad/css-prop-named-variable: 0 */
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '../../atoms';
import { Check, Loading } from '../../icons';
import { CollabAccessDropdown } from '../../molecules/CollabAccessDropdown/CollabAccessDropdown';
import { CollabMembersRights } from '../../molecules/CollabMembersRights/CollabMembersRights';
import { cssVar, p14Medium, p14Regular } from '../../primitives';
import { PermissionType } from '../../types';
import { NotebookAccessActionsReturn } from '@decipad/interfaces';
import { UserAccessMetaFragment } from '@decipad/graphql-client';

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
  flexDirection: 'column',
  input: {
    paddingTop: '7px',
    paddingBottom: '7px',
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
  readonly nrOfTeamMembers?: number;
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
  usersWithAccess,
  teamName,
  nrOfTeamMembers = 0,
  manageTeamURL,
  isAdmin,
  workspaceId,
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
              placeholder="Enter email address"
              value={email}
              onChange={setEmail}
              onEnter={handleAddCollaborator}
              disabled={disabled}
            />

            <span
              css={inputAccessPickerStyles}
              data-testid="select-share-permission"
            >
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
