/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { FC, useCallback, useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Dot, Toggle, Tooltip } from '../../atoms';
import { Link, World } from '../../icons';
import { NotebookAvatar } from '../../molecules';
import {
  cssVar,
  p13Regular,
  p14Medium,
  setCssVar,
  smallScreenQuery,
  smallShadow,
} from '../../primitives';
import { NotebookInvitationPopUp } from '../NotebookInvitationPopUp/NotebookInvitationPopUp';

/**
 * The parent div styles, this handles the position of the pop up relative to the button.
 */
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
  boxShadow: `0px 2px 16px -4px ${smallShadow.rgba}`,
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
  padding: 8,
  alignItems: 'flex-start',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: 8,
  button: {
    height: 18,
    width: 34,
  },
  'button span': {
    height: 14,
    width: 14,
  },
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
  gap: '6px',
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
  hasPaywall?: boolean;
  allUsers?: NotebookAvatar[] | null;
  isAdmin?: boolean;
  notebook: {
    id: string;
    name: string;
    snapshots?: {
      createdAt?: string;
      updatedAt?: string;
      snapshotName?: string;
    }[];
  };
  hasUnpublishedChanges?: boolean;
  isPublished?: boolean;
  isPublishing?: boolean;
  onPublish?: () => void;
  onRestore?: () => void;
  onUnpublish?: () => void;
}

const SNAPSHOT_NAME = 'Published 1';

const HorizontalDivider = () => (
  <div
    css={[
      {
        width: '100%',
        height: '1px',
        backgroundColor: cssVar('strongerHighlightColor'),
        [smallScreenQuery]: {
          display: 'none',
        },
      },
    ]}
  />
);

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookPublishingPopUp = ({
  notebook,
  hasUnpublishedChanges = false,
  isPublished = false,
  isPublishing = false,
  onPublish = noop,
  hasPaywall,
  allUsers,
  isAdmin = false,
  onUnpublish = noop,
  ...sharingProps
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const clientEvent = useContext(ClientEventsContext);

  const [toggleState, setToggleState] = useState(isPublished);

  const link = isServerSideRendering()
    ? ''
    : new URL(
        notebooks({}).notebook({ notebook }).$,
        window.location.origin
      ).toString();

  const onPublishToggle = useCallback(
    (newIsPublished: boolean) => {
      setToggleState(newIsPublished);
      newIsPublished ? onPublish() : onUnpublish();
    },
    [onPublish, onUnpublish]
  );

  const toggleMenuOpen = useCallback(() => {
    setShareMenuOpen(!shareMenuOpen);
  }, [shareMenuOpen]);

  const currentSnapshot = notebook.snapshots?.find(
    (ss) => ss.snapshotName === SNAPSHOT_NAME
  );

  const popoverDiv = (
    <div css={popUpStyles}>
      <div css={innerPopUpStyles}>
        <div css={groupStyles} className="notebook-invitation-popup">
          <NotebookInvitationPopUp
            notebook={notebook}
            hasPaywall={hasPaywall}
            usersWithAccess={allUsers}
            isAdmin={isAdmin}
            {...sharingProps}
          />
        </div>

        {isAdmin && (
          <>
            <HorizontalDivider />
            <div css={groupStyles}>
              <div
                css={[
                  titleAndToggleStyles,
                  toggleState && {
                    'button span': { left: `calc(100% - 15px) !important` },
                  },
                ]}
              >
                <span
                  css={{
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    svg: {
                      ...setCssVar('currentTextColor', cssVar('weakTextColor')),
                    },
                  }}
                >
                  <span css={{ display: 'grid', width: 16, height: 16 }}>
                    <World />
                  </span>
                  <p
                    css={css(
                      p14Medium,
                      setCssVar('currentTextColor', cssVar('weakTextColor'))
                    )}
                  >
                    {isPublishing
                      ? 'Creating link...'
                      : isPublished
                      ? 'Anyone with link can view'
                      : 'Anyone with link can view'}
                  </p>
                </span>

                <Toggle
                  ariaRoleDescription="enable publishing"
                  active={toggleState}
                  onChange={onPublishToggle}
                  disabled={isPublishing}
                />
              </div>
              <p css={descriptionStyles}>
                {isPublished
                  ? 'Anyone with this link can view your notebook.'
                  : ''}
              </p>
            </div>
          </>
        )}

        {isPublished && (
          <div css={groupStyles}>
            <div css={clipboardWrapperStyles}>
              <Tooltip
                variant="small"
                open={copiedPublicStatusVisible}
                usePortal={false}
                trigger={
                  <div>
                    <CopyToClipboard
                      text={link}
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
                        css={copyButtonStyles}
                        aria-roledescription="copy url to clipboard"
                        data-testid="copy-published-link"
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
              <p css={padLinkTextStyles}>{link.replace(/https?:\/\//, '')}</p>
            </div>
          </div>
        )}
        {isAdmin && hasUnpublishedChanges && (
          <div css={groupStyles}>
            {(currentSnapshot?.createdAt || currentSnapshot?.updatedAt) && (
              <p css={descriptionStyles} data-testid="version-date">
                Previous version from{' '}
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
                type="primaryBrand"
                onClick={onPublish}
                disabled={isPublishing}
                testId="publish-changes"
              >
                {isPublishing ? 'Sharing...' : 'Share with new changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover.Root
      defaultOpen
      open={shareMenuOpen}
      onOpenChange={setShareMenuOpen}
    >
      <Popover.Trigger asChild>
        {isPublished && hasUnpublishedChanges ? (
          <Button
            type="primaryBrand"
            onClick={toggleMenuOpen}
            testId="publish-button"
          >
            <div css={{ position: 'relative' }}>
              <Dot top={-13} right={-20}>
                Share
              </Dot>
            </div>
          </Button>
        ) : (
          <Button
            type="primaryBrand"
            onClick={toggleMenuOpen}
            testId="publish-button"
          >
            Share
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Content sideOffset={15}>{popoverDiv}</Popover.Content>
    </Popover.Root>
  );
};
