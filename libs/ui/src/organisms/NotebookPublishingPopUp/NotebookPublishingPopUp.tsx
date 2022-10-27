import { ClientEventsContext } from '@decipad/client-events';
import { useWindowListener } from '@decipad/react-utils';
import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Tooltip } from '../../atoms';
import { Link } from '../../icons';
import {
  black,
  cssVar,
  p12Regular,
  p13Medium,
  p13Regular,
  p13SemiBold,
  p14Medium,
  setCssVar,
  smallestDesktop,
  transparency,
} from '../../primitives';

const wrapperStyles = css({
  position: 'relative',
});

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

/**
 * The parent div styles, this handles the position of the pop up relative to the button.
 */
const popUpStyles = css({
  position: 'absolute',
  right: 0,
  top: 50,

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
  gap: '30px',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

/**
 * The styles for the description of the pop up.
 */
const descriptionStyles = css(p13Regular, {
  ...setCssVar('currentTextColor', cssVar('weakerTextColor')),
});

const unpublishStyles = css(p12Regular, {
  textAlign: 'center',
  cursor: 'pointer',
});

/**
 * The styles for the parent div that wraps the copy button and the text box.
 */
const clipboardWrapperStyles = css({
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

interface NotebookSharingPopUpProps {
  notebook: { id: string; name: string };
  hasLocalChanges?: boolean;
  isPublished?: boolean;
  onPublish?: () => void;
  onUnpublish?: () => void;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookPublishingPopUp = ({
  notebook,
  hasLocalChanges = false,
  isPublished = false,
  onPublish = noop,
  onUnpublish = noop,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const clientEvent = useContext(ClientEventsContext);

  const handleClickOutside = () => {
    setShareMenuOpen(false);
  };
  useWindowListener('click', handleClickOutside);

  const link = new URL(
    notebooks({}).notebook({ notebook }).$,
    window.location.origin
  ).toString();

  return (
    <div css={wrapperStyles} onClick={(e) => e.stopPropagation()}>
      <Button
        type="primaryBrand"
        onClick={() => setShareMenuOpen(!shareMenuOpen)}
      >
        Share & Publish
      </Button>

      <div>
        {shareMenuOpen && (
          <div css={[popUpStyles]}>
            <div css={innerPopUpStyles}>
              <div css={groupStyles}>
                <p css={css(p14Medium)}>Share & Publish space</p>
                {!isPublished ? (
                  <>
                    <p css={descriptionStyles}>
                      Your notebook is{' '}
                      <strong css={css(p13Medium)}>unpublished</strong>. Publish
                      your changes to make it discoverable by anyone via sharing
                    </p>
                    <Button type="primaryBrand" onClick={onPublish}>
                      Publish notebook
                    </Button>
                  </>
                ) : hasLocalChanges ? (
                  <>
                    <p css={descriptionStyles}>
                      Your notebook is{' '}
                      <strong css={css(p13Medium)}>published</strong>, but it
                      has been changed and needs to be republished to show those
                      changes
                    </p>
                    <Button type="primaryBrand" onClick={onPublish}>
                      Republish
                    </Button>
                  </>
                ) : (
                  <>
                    <p css={descriptionStyles}>
                      Your notebook is{' '}
                      <strong css={css(p13Medium)}>published</strong>
                    </p>
                    <Button onClick={onUnpublish}>Unpublish</Button>
                  </>
                )}
                {hasLocalChanges && isPublished && (
                  <p css={css(unpublishStyles)} onClick={onUnpublish}>
                    You can always{' '}
                    <strong css={css(p13SemiBold)}>Unpublish</strong>
                  </p>
                )}
              </div>
              {isPublished && (
                <div css={groupStyles}>
                  <p css={css(p14Medium)}>Share your work</p>
                  <p css={descriptionStyles}>
                    Only people with the link will be able to view this notebook
                  </p>
                  <div css={clipboardWrapperStyles}>
                    <Tooltip
                      variant="small"
                      open={copiedPublicStatusVisible}
                      trigger={
                        <div>
                          <CopyToClipboard
                            text={link}
                            onCopy={() => {
                              setCopiedPublicStatusVisible(true);
                              setTimeout(() => {
                                setCopiedPublicStatusVisible(false);
                              }, 1000);
                              // Analytics
                              clientEvent({
                                type: 'action',
                                action: 'notebook share link copied',
                              });
                            }}
                          >
                            <button
                              css={copyButtonStyles}
                              aria-roledescription="copy url to clipboard"
                            >
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
