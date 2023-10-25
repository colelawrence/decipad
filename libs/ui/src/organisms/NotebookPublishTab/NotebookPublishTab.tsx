import { css } from '@emotion/react';
import { cssVar, p13Regular, p14Medium, p14Regular } from '../../primitives';
import { Link } from '../../icons';
import { Button, Dot, Toggle, Tooltip } from '../../atoms';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useCallback, useContext, useState } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { format } from 'date-fns';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';

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

  alignItems: 'center',

  button: {
    height: 18,
    width: 34,
  },
  'button span': {
    height: 14,
    width: 14,
  },
});

const titleStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

/**
 * The styles for the parent div that wraps the copy button and the text box.
 */
const clipboardWrapperStyles = css({
  height: '32px',
  border: '1px solid',
  borderColor: cssVar('backgroundHeavy'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
});

const copyButtonStyles = css(p13Regular, {
  height: '100%',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  padding: '0px 8px 0px 4px',
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
});

const copyInnerButtonStyles = css(p13Regular, {
  fontWeight: 700,
  color: cssVar('textHeavy'),
  padding: '0px 2px',
});

/**
 * The link text box on the right side of the copy button styles.
 */
const padLinkTextStyles = css(p13Regular, {
  userSelect: 'all',

  width: '100%',
  overflow: 'hidden',
  padding: '0px 6px',
});

/* eslint decipad/css-prop-named-variable: 0 */
interface NotebookPublishTabProps {
  readonly notebookId: string;
  readonly isAdmin: boolean;
  readonly isPublished: boolean;
  readonly hasUnpublishedChanges: boolean;
  readonly link: string;
  readonly currentSnapshot:
    | {
        createdAt?: string;
        updatedAt?: string;
        snapshotName?: string;
      }
    | undefined;
  readonly setShareMenuOpen: (open: boolean) => void;
  readonly isPublishing: boolean;
  readonly setIsPublishing: (isPublishing: boolean) => void;
  readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
  readonly onUnpublish: NotebookMetaActionsReturn['onUnpublishNotebook'];
}

export const NotebookPublishTab = ({
  notebookId,
  isAdmin,
  isPublished,
  hasUnpublishedChanges,
  currentSnapshot,
  link,
  setShareMenuOpen,
  isPublishing,
  setIsPublishing,
  onPublish,
  onUnpublish,
}: NotebookPublishTabProps) => {
  const clientEvent = useContext(ClientEventsContext);
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);

  const [toggleState, setToggleState] = useState(isPublished);

  const onPublishToggle = useCallback(
    (newIsPublished: boolean) => {
      setToggleState(newIsPublished);
      setIsPublishing(true);
      if (newIsPublished) {
        onPublish(notebookId).then(() => setIsPublishing(false));
        return;
      }
      onUnpublish(notebookId).then(() => setIsPublishing(false));
    },
    [notebookId, onPublish, onUnpublish, setIsPublishing]
  );
  return (
    <div css={innerPopUpStyles}>
      {isAdmin && (
        <>
          <div css={groupStyles}>
            <div
              css={[
                titleAndToggleStyles,
                toggleState && {
                  'button span': { left: `calc(100% - 16px) !important` },
                },
              ]}
            >
              <div css={titleStyles}>
                <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
                  Publish Online
                </p>
                <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
                  {!isPublished && isPublishing
                    ? 'Creating a link...'
                    : 'Anyone with link can view'}
                </p>
              </div>

              <Toggle
                ariaRoleDescription="enable publishing"
                active={toggleState}
                onChange={onPublishToggle}
                disabled={isPublishing}
              />
            </div>
          </div>
        </>
      )}
      {isAdmin && isPublished && hasUnpublishedChanges && (
        <div css={groupStyles}>
          {(currentSnapshot?.createdAt || currentSnapshot?.updatedAt) && (
            <p css={p13Regular} data-testid="version-date">
              Current published version from{' '}
              {format(
                new Date(
                  currentSnapshot.updatedAt ?? currentSnapshot.createdAt ?? ''
                ),
                'LLL do, HH:mm'
              )}
            </p>
          )}
          <div css={horizontalGroupStyles}>
            <Button
              size="extraSlim"
              type="tertiaryAlt"
              onClick={() => onPublish(notebookId)}
              disabled={isPublishing}
              testId="publish-changes"
            >
              {isPublishing ? (
                <span>Publishing...</span>
              ) : (
                <span
                  css={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}
                >
                  <Dot noBorder size={4} position="relative" />
                  Publish with new changes
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
      {isPublished && (
        <div css={groupStyles}>
          <div css={clipboardWrapperStyles}>
            <div css={copyButtonStyles}>
              <Tooltip
                variant="small"
                open={copiedPublicStatusVisible}
                usePortal={false}
                trigger={
                  <div>
                    <CopyToClipboard
                      text={link}
                      options={{ format: 'text/plain' }}
                      onCopy={() => {
                        setCopiedPublicStatusVisible(true);
                        setTimeout(() => {
                          setCopiedPublicStatusVisible(false);
                          setShareMenuOpen(false);
                        }, 1000);
                        // Analytics
                        clientEvent({
                          type: 'action',
                          action: 'notebook share link copied',
                        });
                      }}
                    >
                      <button
                        aria-roledescription="copy url to clipboard"
                        data-testid="copy-published-link"
                        css={copyInnerButtonStyles}
                      >
                        <Link />
                        <span css={{ paddingTop: '1px' }}>Copy</span>
                      </button>
                    </CopyToClipboard>
                  </div>
                }
              >
                <p>Copied!</p>
              </Tooltip>
            </div>

            <p css={padLinkTextStyles}>{link.replace(/https?:\/\//, '')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
