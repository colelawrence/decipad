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
import { Button, Dot, MenuItem, Toggle, Tooltip } from '../../atoms';
import { Caret, Code, Copy, Link, World } from '../../icons';
import { MenuList, NotebookAvatar } from '../../molecules';
import {
  cssVar,
  p13Regular,
  p14Medium,
  smallScreenQuery,
  smallShadow,
} from '../../primitives';
import { NotebookInvitationPopUp } from '../NotebookInvitationPopUp/NotebookInvitationPopUp';
import { isFlagEnabled } from '@decipad/feature-flags';

/**
 * The parent div styles, this handles the position of the pop up relative to the button.
 */
const popUpStyles = css({
  width: '310px',
  padding: '16px',
  [smallScreenQuery]: {
    width: '250px',
  },

  backgroundColor: cssVar('backgroundMain'),
  border: '1px solid',
  borderColor: cssVar('borderDefault'),
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
  backgroundColor: cssVar('backgroundDefault'),
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
 * The styles for the parent div that wraps the copy button and the text box.
 */
const clipboardWrapperStyles = css({
  height: '32px',
  border: '1px solid',
  borderColor: cssVar('backgroundDefault'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
});

const copyButtonStyles = css(p13Regular, {
  height: '100%',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  padding: '0px 8px',
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

/**
 * The link text box on the right side of the copy button styles.
 */
const padLinkTextStyles = css(p13Regular, {
  userSelect: 'all',

  width: '100%',
  overflow: 'hidden',
  padding: '0px 2px',
});

const copyMenuTriggerStyles = css({
  display: 'flex',
  alignItems: 'center',
  svg: { width: 16, height: 16 },
});

const copyMenuItemStyles = css({
  display: 'flex',
  gap: 4,

  svg: { width: 16, height: 16 },
});

interface NotebookSharingPopUpProps {
  readonly hasPaywall?: boolean;
  readonly invitedUsers?: NotebookAvatar[] | null;
  readonly teamUsers?: NotebookAvatar[] | null;
  readonly manageTeamURL?: string;
  readonly teamName?: string;
  readonly isAdmin?: boolean;
  readonly notebook: {
    id: string;
    name: string;
    snapshots?: {
      createdAt?: string;
      updatedAt?: string;
      snapshotName?: string;
    }[];
  };
  readonly hasUnpublishedChanges?: boolean;
  readonly isPublished?: boolean;
  readonly isPublishing?: boolean;
  readonly onPublish?: () => void;
  readonly onRestore?: () => void;
  readonly onUnpublish?: () => void;
}

const SNAPSHOT_NAME = 'Published 1';

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
  invitedUsers,
  teamName,
  teamUsers,
  manageTeamURL,
  isAdmin = false,
  onUnpublish = noop,
  ...sharingProps
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);
  const [copyDropdown, setCopyDropdwn] = useState(false);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const clientEvent = useContext(ClientEventsContext);

  const [toggleState, setToggleState] = useState(isPublished);

  const link = isServerSideRendering()
    ? ''
    : new URL(
        notebooks({}).notebook({ notebook }).$,
        window.location.origin
      ).toString();

  const embedLink = `${link}?embed=true`;

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
            usersWithAccess={invitedUsers}
            teamUsers={teamUsers}
            teamName={teamName}
            manageTeamURL={manageTeamURL}
            isAdmin={isAdmin}
            {...sharingProps}
          />
        </div>

        {isAdmin && (
          <>
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
                    svg: {},
                  }}
                >
                  <span css={{ display: 'grid', width: 16, height: 16 }}>
                    <World />
                  </span>
                  <p css={css(p14Medium)}>
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
            </div>
          </>
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
                          css={{ paddingLeft: '2px', paddingRight: '2px' }}
                        >
                          <Link />
                          Copy
                        </button>
                      </CopyToClipboard>
                    </div>
                  }
                >
                  <p>Copied!</p>
                </Tooltip>
                {isFlagEnabled('EMBED') && (
                  <MenuList
                    root
                    dropdown
                    portal={false}
                    open={copyDropdown}
                    onChangeOpen={setCopyDropdwn}
                    trigger={
                      <div css={copyMenuTriggerStyles}>
                        <Caret variant="down" />
                      </div>
                    }
                  >
                    <MenuItem>
                      <CopyToClipboard text={link}>
                        <div css={copyMenuItemStyles}>
                          <Copy />
                          Copy invitation link
                        </div>
                      </CopyToClipboard>
                    </MenuItem>
                    <MenuItem>
                      <CopyToClipboard text={embedLink}>
                        <div css={copyMenuItemStyles}>
                          <Code />
                          Copy embed link
                        </div>
                      </CopyToClipboard>
                    </MenuItem>
                  </MenuList>
                )}
              </div>

              <p css={padLinkTextStyles}>{link.replace(/https?:\/\//, '')}</p>
            </div>
          </div>
        )}
        {isAdmin && hasUnpublishedChanges && (
          <div css={groupStyles}>
            {(currentSnapshot?.createdAt || currentSnapshot?.updatedAt) && (
              <p css={p13Regular} data-testid="version-date">
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
      onOpenChange={(v) => {
        if (!copyDropdown) {
          setShareMenuOpen(v);
        }
      }}
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
