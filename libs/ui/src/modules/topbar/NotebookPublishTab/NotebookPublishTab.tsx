/* eslint-disable camelcase */
import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p13Regular,
  p14Bold,
  p14Medium,
  p14Regular,
  p8Medium,
} from '../../../primitives';
import { Caret, Check, Link, Lock, World } from '../../../icons';
import { Button, Dot, Tooltip } from '../../../shared';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FC, ReactNode, useContext, useState } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { format } from 'date-fns';
import {
  NotebookMetaActionsReturn,
  UnpublishedChangesType,
} from '@decipad/interfaces';
import { Publish_State } from '@decipad/graphql-client';
import * as Popover from '@radix-ui/react-popover';

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

const triggerStyles = css(p14Bold, {
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  padding: '8px',
  svg: { width: '16px', height: '16px' },
});

const triggerTitleIconStyles = css({
  display: 'flex',
  gap: '4px',
});

const publishModeWrapper = css({
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  marginTop: '8px',
  width: 'calc(320px - 32px)',
  borderRadius: '8px',
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',
  padding: '6px',
  gap: '6px',
  zIndex: 10000,
  svg: {
    width: '24px',
    height: '24px',
  },
});

const publishMode = css({
  display: 'flex',
  gap: '12px',
  padding: '12px',
  cursor: 'pointer',
  borderRadius: '6px',

  ':hover:not([aria-disabled="true"])': {
    background: cssVar('backgroundDefault'),
  },

  '&[aria-selected="true"]:not([aria-disabled="true"])': {
    background: cssVar('backgroundDefault'),
  },

  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  p: {
    ...p14Bold,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
  span: {
    ...p13Regular,
    color: cssVar('textSubdued'),
  },
});

const PublishingTextMap: Record<Publish_State, string> = {
  PUBLICLY_HIGHLIGHTED: 'Public on the web',
  PUBLIC: 'Private URL',
  PRIVATE: 'Not Published',
};

const PublishingIconMap: Record<Publish_State, ReactNode> = {
  PUBLICLY_HIGHLIGHTED: <World />,
  PUBLIC: <Link />,
  PRIVATE: <Lock />,
};

const requiresUpgradeStyles = css(p8Medium, {
  display: 'flex',
  padding: '4px',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '4px',
  background: componentCssVars('RequiresPremium'),
  color: componentCssVars('RequiresPremiumText'),
  textTransform: 'uppercase',
});

const RequiresUpgrade: FC = () => (
  <div css={requiresUpgradeStyles}>Requires Upgrade</div>
);

const PublishingWriting: FC = () => (
  <div css={innerPopUpStyles}>
    <div css={groupStyles}>
      <div css={titleAndToggleStyles}>
        <div css={titleStyles}>
          <p css={css(p14Medium, { color: cssVar('textHeavy') })}>
            Publish Online
          </p>
          <p css={css(p14Regular, { color: cssVar('textSubdued') })}>
            Create a public URL and manage some settings to share your work.
            <span css={[p14Medium, { paddingLeft: '4px' }]}>
              Check our docs
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PublishedDate: FC<{
  currentSnapshot: NotebookPublishTabProps['currentSnapshot'];
  hasUnpublishedChanges: NotebookPublishTabProps['hasUnpublishedChanges'];
}> = ({ hasUnpublishedChanges, currentSnapshot }) => {
  if (
    currentSnapshot == null ||
    currentSnapshot.createdAt == null ||
    currentSnapshot.updatedAt == null ||
    hasUnpublishedChanges === 'not-published'
  ) {
    return null;
  }

  const date = format(
    new Date(currentSnapshot.updatedAt ?? currentSnapshot.createdAt ?? ''),
    'LLL do, HH:mm'
  );

  return (
    <p css={p13Regular} data-testid="version-date">
      Current published version from {date}
    </p>
  );
};

/* eslint decipad/css-prop-named-variable: 0 */
interface NotebookPublishTabProps {
  readonly notebookId: string;
  readonly isAdmin: boolean;
  readonly publishingState: Publish_State;
  readonly isPremium: boolean;
  readonly hasUnpublishedChanges: UnpublishedChangesType;
  readonly link: string;
  readonly currentSnapshot:
    | {
        createdAt?: string;
        updatedAt?: string;
        snapshotName?: string;
      }
    | undefined;
  readonly isPublishing: boolean;
  readonly setIsPublishing: (isPublishing: boolean) => void;
  readonly onUpdatePublish: NotebookMetaActionsReturn['onUpdatePublishState'];
  readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
}

/**
 * Publishing controls UI.
 *
 * Only visible to admins of the notebook.
 */
export const NotebookPublishTab = ({
  notebookId,
  isAdmin,
  publishingState,
  hasUnpublishedChanges,
  currentSnapshot,
  link,
  isPremium,
  isPublishing,
  onUpdatePublish,
  onPublish,
}: NotebookPublishTabProps) => {
  const isPublished = publishingState !== 'PRIVATE';

  const clientEvent = useContext(ClientEventsContext);
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);

  const [open, setOpen] = useState(false);

  return (
    <div css={innerPopUpStyles}>
      {isAdmin && (
        <>
          <PublishingWriting />
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger>
              <div css={triggerStyles} data-testid="publish-dropdown">
                <div css={triggerTitleIconStyles}>
                  {PublishingIconMap[publishingState]}
                  {PublishingTextMap[publishingState]}
                </div>
                {isAdmin && <Caret variant="down" />}
              </div>
            </Popover.Trigger>
            <Popover.Content>
              <div css={publishModeWrapper}>
                <div
                  css={publishMode}
                  aria-selected={publishingState === 'PRIVATE'}
                  onClick={() => {
                    setOpen(false);
                    onUpdatePublish(notebookId, 'PRIVATE');
                  }}
                >
                  <div>
                    <p>
                      {PublishingIconMap.PRIVATE}
                      {PublishingTextMap.PRIVATE}
                    </p>
                    <span>
                      This notebook is only accessible to collaborators and
                      workspace members.
                    </span>
                  </div>
                  {publishingState === 'PRIVATE' && <Check />}
                </div>

                <div
                  css={publishMode}
                  aria-selected={publishingState === 'PUBLICLY_HIGHLIGHTED'}
                  onClick={() => {
                    setOpen(false);
                    onUpdatePublish(notebookId, 'PUBLICLY_HIGHLIGHTED');
                  }}
                  data-testid="publish-public"
                >
                  <div>
                    <p>
                      {PublishingIconMap.PUBLICLY_HIGHLIGHTED}
                      {PublishingTextMap.PUBLICLY_HIGHLIGHTED}
                    </p>
                    <span>
                      Anyone can view this notebook. It will show up in search
                      engines, on your profile and in the notebook gallery on
                      our website.
                    </span>
                  </div>
                  {publishingState === 'PUBLICLY_HIGHLIGHTED' && <Check />}
                </div>

                <div
                  css={publishMode}
                  aria-selected={publishingState === 'PUBLIC'}
                  aria-disabled={!isPremium}
                  onClick={() => {
                    if (!isPremium) return;
                    setOpen(false);
                    onUpdatePublish(notebookId, 'PUBLIC');
                  }}
                >
                  <div>
                    <p>
                      {PublishingIconMap.PUBLIC}
                      {PublishingTextMap.PUBLIC}
                      {!isPremium && <RequiresUpgrade />}
                    </p>
                    <span>
                      Only people you share the link with can view this
                      document. It will not show up in search engines or on your
                      profile, or in the notebook gallery on our website.
                    </span>
                  </div>
                  {publishingState === 'PUBLIC' && <Check />}
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
        </>
      )}
      {isPublished && (
        <PublishedDate
          currentSnapshot={currentSnapshot}
          hasUnpublishedChanges={hasUnpublishedChanges}
        />
      )}
      {isAdmin && isPublished && hasUnpublishedChanges !== 'up-to-date' && (
        <div css={groupStyles}>
          <div css={horizontalGroupStyles}>
            <Button
              size="extraSlim"
              type={
                hasUnpublishedChanges === 'not-published'
                  ? 'primaryBrand'
                  : 'tertiaryAlt'
              }
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
                  {hasUnpublishedChanges === 'unpublished-changes' && !open && (
                    <Dot noBorder size={8} position="relative" />
                  )}
                  {hasUnpublishedChanges === 'not-published'
                    ? 'Publish'
                    : 'Publish with new changes'}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
      {isPublished && hasUnpublishedChanges !== 'not-published' && (
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
                        <span>Copy</span>
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
