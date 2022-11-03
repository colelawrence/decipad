import { ClientEventsContext } from '@decipad/client-events';
import { useWindowListener } from '@decipad/react-utils';
import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { format } from 'date-fns';
import { isEmpty } from 'lodash';
import { FC, useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Dot, Toggle, Tooltip } from '../../atoms';
import { Link } from '../../icons';
import {
  black,
  cssVar,
  p13Regular,
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
  notebook: { id: string; name: string; snapshots?: { createdAt: string }[] };
  hasUnpublishedChanges?: boolean;
  isPublished?: boolean;
  onPublish?: () => void;
  onRestore?: () => void;
  onUnpublish?: () => void;
}

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookPublishingPopUp = ({
  notebook,
  hasUnpublishedChanges = false,
  isPublished = false,
  onPublish = noop,
  onRestore = noop,
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

  const buttonProps = {
    onClick: () => setShareMenuOpen(!shareMenuOpen),
  };

  return (
    <div css={wrapperStyles} onClick={(e) => e.stopPropagation()}>
      {isPublished ? (
        hasUnpublishedChanges ? (
          <Dot>
            <Button type="primaryBrand" {...buttonProps}>
              Republish
            </Button>
          </Dot>
        ) : (
          <Button type="primaryBrand" {...buttonProps}>
            Published
          </Button>
        )
      ) : (
        <Button type="secondary" {...buttonProps}>
          Publish
        </Button>
      )}

      <div>
        {shareMenuOpen && (
          <div css={[popUpStyles]}>
            <div css={innerPopUpStyles}>
              <div css={groupStyles}>
                <div css={titleAndToggleStyles}>
                  <p css={css(p14Medium)}>Publish Notebook</p>
                  <Toggle
                    ariaRoleDescription="enable publishing"
                    active={isPublished}
                    onChange={(newIsPublished) =>
                      newIsPublished ? onUnpublish() : onPublish()
                    }
                  />
                </div>
                <p css={descriptionStyles}>
                  {isPublished
                    ? 'Anyone with this link can view your notebook.'
                    : 'Notebook is only visible to you.'}
                </p>
              </div>

              {isPublished && (
                <div css={groupStyles}>
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

              {isPublished &&
                hasUnpublishedChanges &&
                !isEmpty(notebook.snapshots) && (
                  <div css={groupStyles}>
                    <p css={descriptionStyles}>
                      Previous version from{' '}
                      {format(
                        new Date(notebook.snapshots?.[0].createdAt ?? ''),
                        'LLL do, HH:mm'
                      )}
                    </p>
                    <div css={horizontalGroupStyles}>
                      <Button type="secondary" onClick={onRestore}>
                        Restore
                      </Button>
                      <Button type="primaryBrand" onClick={onPublish}>
                        Publish New Changes
                      </Button>
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
