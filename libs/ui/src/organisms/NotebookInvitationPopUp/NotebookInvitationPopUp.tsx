import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { InputField, Button } from '../../atoms';
import { Loading } from '../../icons';
import {
  black,
  cssVar,
  p13Regular,
  p14Medium,
  setCssVar,
  smallScreenQuery,
  transparency,
} from '../../primitives';

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
  boxShadow: `0px 2px 16px -4px ${transparency(black, 0.06)}`,
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

interface NotebookSharingPopUpProps {
  notebook: { id: string; name: string; snapshots?: { createdAt?: string }[] };
  onInvite?: (email: string) => Promise<void>;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookInvitationPopUp = ({
  onInvite = () => Promise.resolve(),
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [email, setEmail] = useState('');
  const [loading, setIsLoading] = useState(false);

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

        <div css={horizontalGroupStyles} style={{ maxHeight: '32px' }}>
          <InputField
            value={email}
            onChange={setEmail}
            placeholder="Add email to collaborate"
          />
          <Button
            size="extraSlim"
            onClick={() => {
              if (email) {
                setIsLoading(true);
                onInvite(email).finally(() => setIsLoading(false));
              }
            }}
          >
            {loading && <Loading />} Invite
          </Button>
        </div>
      </div>
    </div>
  );
};
