/* eslint-disable complexity */
/* eslint-disable decipad/css-prop-named-variable */
/* eslint-disable camelcase */
import { Caret, Check, Link, Lock, World } from '../../../icons';
import { Button, Dot, Tooltip } from '../../../shared';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FC, ReactNode, useContext, useState } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { Publish_State } from '@decipad/graphql-client';
import * as Popover from '@radix-ui/react-popover';
import * as S from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { PublishControls } from './PublishControls';

const PublishingTextMap: Record<Publish_State, string> = {
  PUBLICLY_HIGHLIGHTED: 'Public on the web',
  PUBLIC: isFlagEnabled('NEW_PAYMENTS') ? 'Private URL' : 'Published',
  PRIVATE: 'Not Published',
};

const PublishingIconMap: Record<Publish_State, ReactNode> = {
  PUBLICLY_HIGHLIGHTED: <World />,
  PUBLIC: <Link />,
  PRIVATE: <Lock />,
};

/**
 * Publishing controls UI.
 *
 * Only visible to admins of the notebook.
 */
export const NotebookPublishTab: FC<S.NotebookPublishTabProps> = ({
  notebookId,
  isAdmin,
  publishingState,
  publishedVersionState,
  currentSnapshot,
  link,
  isPremium,
  onUpdatePublish,
  onPublish,
  onUpdateAllowDuplicate,
  allowDuplicate,
}) => {
  const isPublished = publishingState !== 'PRIVATE';
  const disablePubliclyHighlighted =
    !isPremium && isFlagEnabled('NEW_PAYMENTS');

  const clientEvent = useContext(ClientEventsContext);
  const [copiedPublicStatusVisible, setCopiedPublicStatusVisible] =
    useState(false);

  const [open, setOpen] = useState(false);

  return (
    <div css={S.innerPopUpStyles}>
      {isAdmin && (
        <>
          <S.BasicGap>
            <S.PublishingWriting />
          </S.BasicGap>
          <S.BasicGap css={S.HackyButNeededZIndexStyles}>
            <Popover.Root open={open} onOpenChange={setOpen}>
              <Popover.Trigger>
                <div css={S.triggerStyles} data-testid="publish-dropdown">
                  <div css={S.triggerTitleIconStyles}>
                    {PublishingIconMap[publishingState]}
                    {PublishingTextMap[publishingState]}
                  </div>
                  {isAdmin && <Caret variant="down" />}
                </div>
              </Popover.Trigger>
              <Popover.Content>
                <div css={S.publishModeWrapper}>
                  <div
                    css={S.publishMode}
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

                  {isFlagEnabled('NEW_PAYMENTS') && (
                    <div
                      css={S.publishMode}
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
                          Anyone can view this notebook. It will show up in
                          search engines, on your profile and in the notebook
                          gallery on our website.
                        </span>
                      </div>
                      {publishingState === 'PUBLICLY_HIGHLIGHTED' && <Check />}
                    </div>
                  )}

                  <div
                    css={S.publishMode}
                    aria-selected={publishingState === 'PUBLIC'}
                    aria-disabled={disablePubliclyHighlighted}
                    data-testid="publish-private-url"
                    onClick={() => {
                      if (disablePubliclyHighlighted) return;
                      setOpen(false);
                      onUpdatePublish(notebookId, 'PUBLIC');
                    }}
                  >
                    <div>
                      <p>
                        {PublishingIconMap.PUBLIC}
                        {PublishingTextMap.PUBLIC}
                        {disablePubliclyHighlighted && <S.RequiresUpgrade />}
                      </p>
                      <span>
                        {isFlagEnabled('NEW_PAYMENTS')
                          ? `Only people you share the link with can view this
                      document. It will not show up in search engines or on your
                      profile, or in the notebook gallery on our website.`
                          : 'Make your notebook accessable by a URL'}
                      </span>
                    </div>
                    {publishingState === 'PUBLIC' && <Check />}
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
            <PublishControls
              notebookId={notebookId}
              publishedStatus={publishingState}
              allowDuplicate={allowDuplicate}
              onChangeAllowDuplicate={onUpdateAllowDuplicate}
            />
          </S.BasicGap>
        </>
      )}
      {isPublished && (
        <S.BasicGap>
          <S.PublishedDate
            currentSnapshot={currentSnapshot}
            publishedVersionState={publishedVersionState}
          />
          {isAdmin && publishedVersionState !== 'up-to-date' && (
            <div css={S.groupStyles}>
              <div css={S.horizontalGroupStyles}>
                <Button
                  size="extraSlim"
                  type={
                    publishedVersionState === 'first-time-publish'
                      ? 'primaryBrand'
                      : 'tertiaryAlt'
                  }
                  onClick={() => onPublish(notebookId)}
                  testId="publish-changes"
                >
                  <span css={S.publishNewChangesStyles}>
                    {publishedVersionState === 'unpublished-changes' &&
                      !open && <Dot noBorder size={8} position="relative" />}
                    {publishedVersionState === 'first-time-publish'
                      ? 'Publish'
                      : 'Publish with new changes'}
                  </span>
                </Button>
              </div>
            </div>
          )}
          {publishedVersionState !== 'first-time-publish' && (
            <div css={S.groupStyles}>
              <div css={S.clipboardWrapperStyles}>
                <div css={S.copyButtonStyles}>
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
                              segmentEvent: {
                                type: 'action',
                                action: 'notebook share link copied',
                              },
                            });
                          }}
                        >
                          <button
                            aria-roledescription="copy url to clipboard"
                            data-testid="copy-published-link"
                            css={S.copyInnerButtonStyles}
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

                <p css={S.padLinkTextStyles}>
                  {link.replace(/https?:\/\//, '')}
                </p>
              </div>
            </div>
          )}
        </S.BasicGap>
      )}
    </div>
  );
};
