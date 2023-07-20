/* eslint decipad/css-prop-named-variable: 0 */
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '../../atoms';
import { Check, Loading } from '../../icons';
import { NotebookAvatar } from '../../molecules';
import { CollabAccessDropdown } from '../../molecules/CollabAccessDropdown/CollabAccessDropdown';
import { CollabMembersRights } from '../../molecules/CollabMembersRights/CollabMembersRights';
import { cssVar, p13Regular, p14Medium, setCssVar } from '../../primitives';
import { PermissionType } from '../../types';

/**
 * The styles for the content rendered without the need for the toggle to be activated. This is also the parent of the toggle component.
 */
const innerPopUpStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
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

/**
 * The styles for the description of the pop up.
 */
const descriptionStyles = css(p13Regular, {
  ...setCssVar('currentTextColor', cssVar('weakerTextColor')),
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

interface NotebookSharingPopUpProps {
  readonly hasPaywall?: boolean;
  readonly notebook: {
    id: string;
    name: string;
    snapshots?: { createdAt?: string }[];
    workspace?: {
      id: string;
    };
  };
  readonly isAdmin: boolean;
  readonly usersWithAccess?: NotebookAvatar[] | null;
  readonly onRemove?: (userId: string) => Promise<void>;
  readonly onInvite?: (
    email: string,
    permission: PermissionType
  ) => Promise<void>;
  readonly onChange?: (
    userId: string,
    permission: PermissionType
  ) => Promise<void>;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookInvitationPopUp = ({
  hasPaywall,
  usersWithAccess,
  isAdmin,
  onInvite = () => Promise.resolve(),
  onRemove = () => Promise.resolve(),
  onChange = () => Promise.resolve(),
  notebook,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [permission, setPermission] = useState<PermissionType>('WRITE');
  const navigate = useNavigate();

  const isInvalidEmail = !email.includes('@') || email === session?.user?.email;
  const workspaceId = notebook.workspace?.id;

  const handleAddCollaborator = useCallback(() => {
    if (loading) return;
    if (!email) return;
    if (isInvalidEmail) return;

    setIsLoading(true);
    setEmail('');
    onInvite(email, permission).finally(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    });
  }, [
    email,
    loading,
    permission,
    onInvite,
    isInvalidEmail,
    setIsLoading,
    setSuccess,
  ]);

  const handleRemoveCollaborator = useCallback(
    (userId: string) => {
      if (loading) return;
      setIsLoading(true);
      onRemove(userId).finally(() => setIsLoading(false));
    },
    [loading, onRemove, setIsLoading]
  );

  const handleChangePermission = useCallback(
    (userId: string, perm: PermissionType) => {
      if (loading) return;
      setIsLoading(true);
      onChange(userId, perm).finally(() => setIsLoading(false));
    },
    [loading, onChange, setIsLoading]
  );

  const disabled = hasPaywall || !isAdmin;

  return (
    <div css={innerPopUpStyles}>
      <div css={groupStyles}>
        <div css={titleAndToggleStyles}>
          <p css={css(p14Medium)}>Invite others to this notebook</p>
        </div>
        <p css={descriptionStyles}>Invited users will receive an email.</p>
      </div>

      <div css={invitationFormStyles}>
        <div css={inputContainerStyles}>
          <InputField
            placeholder="Enter email address"
            value={email}
            onChange={setEmail}
            onEnter={handleAddCollaborator}
            disabled={disabled}
          />

          <span css={inputAccessPickerStyles}>
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

      <CollabMembersRights
        usersWithAccess={usersWithAccess}
        onRemoveCollaborator={handleRemoveCollaborator}
        onChangePermission={handleChangePermission}
        disabled={!isAdmin}
      />
    </div>
  );
};
