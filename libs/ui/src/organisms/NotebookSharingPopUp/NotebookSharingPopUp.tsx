import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Toggle, Tooltip } from '../../atoms';
import { Link } from '../../icons';
import {
  cssVar,
  p13Regular,
  p14Medium,
  p14Regular,
  setCssVar,
} from '../../primitives';
import { noop } from '../../utils';

/**
 * The parent div styles, this handles the position of the pop up relative to the button.
 */
const popUpStyles = css({
  position: 'absolute',
  right: 0,
  top: 50,

  width: '350px',
  padding: '20px',

  background: cssVar('backgroundColor'),
  border: '1px solid',
  borderColor: cssVar('highlightColor'),
  borderRadius: '6px',
  boxShadow: `0px 1px 2px ${cssVar('highlightColor')}, 0px 2px 12px ${cssVar(
    'highlightColor'
  )}`,
});

/**
 * The styles for the content rendered without the need for the toggle to be activated. This is also the parent of the toggle component.
 */
const innerPopUpStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

/**
 * The styles for the description of the pop up.
 */
const descriptionStyles = css(p14Regular, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  marginTop: '6px',
});

/**
 * The styles for the parent div that wraps the copy button and the text box.
 */
const clipboardWrapperStyles = css({
  marginTop: '12px',
  border: '1px solid',
  borderColor: cssVar('highlightColor'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  whiteSpace: 'nowrap',
});

/**
 * The copy button styles.
 */
const copyButtonStyles = css(p13Regular, {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: cssVar('highlightColor'),
  padding: '6px 12px',
  borderRadius: '6px',
});

/**
 * The link icon rendered inside the copy button styles.
 */
const copyButtonIconStyles = css({
  width: '18px',
  height: '18px',
  marginRight: '3px',
  '> svg > path': { stroke: cssVar('currentTextColor') },
});

/**
 * The link text box on the right side of the copy button styles.
 */
const padLinkTextStyles = css(
  p13Regular,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    userSelect: 'all',

    width: '100%',
    overflow: 'hidden',
  }
);

export interface NotebookSharingPopUpProps {
  link: string;
  onToggleShare?: () => void;
  sharingActive?: boolean;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookSharingPopUp = ({
  link,
  sharingActive = false,
  onToggleShare = noop,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [copiedStatusVisible, setCopiedStatusVisible] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleClickOutside = () => {
    setShareMenuOpen(false);
  };

  useWindowListener('click', handleClickOutside);

  return (
    <div css={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <Button onClick={() => setShareMenuOpen(!shareMenuOpen)}>Share</Button>

      <div>
        {shareMenuOpen && (
          <div css={[popUpStyles]}>
            <div css={innerPopUpStyles}>
              <div>
                <p css={css(p14Medium)}>Share public link</p>
                <p css={descriptionStyles}>
                  Enable to share links with the public
                </p>
              </div>
              <Toggle
                active={sharingActive}
                onChange={() => {
                  onToggleShare();
                }}
              />
            </div>

            {sharingActive && (
              <div css={clipboardWrapperStyles}>
                <Tooltip
                  variant="small"
                  open={copiedStatusVisible}
                  trigger={
                    <div>
                      <CopyToClipboard
                        text={link}
                        onCopy={() => {
                          setCopiedStatusVisible(true);
                          setTimeout(() => {
                            setCopiedStatusVisible(false);
                          }, 1000);
                        }}
                      >
                        <button css={copyButtonStyles}>
                          <span css={copyButtonIconStyles}>
                            <Link />
                          </span>{' '}
                          Copy
                        </button>
                      </CopyToClipboard>
                    </div>
                  }
                >
                  <p>Copied!</p>
                </Tooltip>
                <p css={padLinkTextStyles}>{link}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
