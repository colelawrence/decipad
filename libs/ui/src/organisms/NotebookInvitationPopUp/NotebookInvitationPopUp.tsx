import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { InputField, Button } from '../../atoms';
import { Check, Loading } from '../../icons';
import {
  black,
  cssVar,
  p13Regular,
  p14Medium,
  setCssVar,
  smallScreenQuery,
  transparency,
} from '../../primitives';
import { NotebookAvatar } from '../../molecules/NotebookAvatars/NotebookAvatars';
import { CollabMembersRights } from '../../molecules/CollabMembersRights/CollabMembersRights';

const popUpStyles = css({
  width: '310px',
  padding: '16px',
  [smallScreenQuery]: {
    width: '250px',
  },

  background: cssVar('backgroundColor'),
  border: '1px solid',
  borderColor: cssVar('strongHighlightColor'),
  borderRadius: '8px',
  boxShadow: `0px 2px 16px -4px ${transparency(black, 0.06).rgba}`,
});

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

const invitationFormStyles = css({
  gap: '8px',
  display: 'flex',
  flexDirection: 'column',
  '>input': {
    paddingTop: '7px',
    paddingBottom: '7px',
    fontSize: '13px',
    lineHeight: '100%',
  },
});

const CheckMark = () => <Check width="16px" style={{ marginRight: '6px' }} />;
const LoadingDots = () => (
  <Loading width="24px" style={{ marginRight: '6px' }} />
);

interface NotebookSharingPopUpProps {
  notebook: { id: string; name: string; snapshots?: { createdAt?: string }[] };
  usersWithAccess?: NotebookAvatar[] | null;
  onInvite?: (email: string) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookInvitationPopUp = ({
  usersWithAccess,
  onInvite = () => Promise.resolve(),
  onRemove = () => Promise.resolve(),
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddCollaborator = useCallback(() => {
    if (loading) return;
    if (email) {
      setIsLoading(true);
      setEmail('');
      onInvite(email).finally(() => {
        setIsLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      });
    }
  }, [email, loading, onInvite, setIsLoading, setSuccess]);

  const handleRemoveCollaborator = useCallback(
    (userId: string) => {
      if (loading) return;
      setIsLoading(true);
      onRemove(userId).finally(() => setIsLoading(false));
    },
    [loading, onRemove, setIsLoading]
  );

  return (
    <div css={[popUpStyles]}>
      <div css={innerPopUpStyles}>
        <div css={groupStyles}>
          <div css={titleAndToggleStyles}>
            <p css={css(p14Medium)}>Invite others to this notebook</p>
          </div>
          <p css={descriptionStyles}>
            Invited users will receive an email to the provided email address.
          </p>
        </div>

        <div css={invitationFormStyles}>
          <InputField
            placeholder="Enter email address"
            value={email}
            onChange={setEmail}
            onEnter={handleAddCollaborator}
          />

          <Button size="extraSlim" onClick={handleAddCollaborator}>
            <div css={invitationButtonContentStyles}>
              {success && <CheckMark />}
              {loading && <LoadingDots />}
              Send invitation
            </div>
          </Button>
        </div>

        <CollabMembersRights
          usersWithAccess={usersWithAccess}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      </div>
    </div>
  );
};
