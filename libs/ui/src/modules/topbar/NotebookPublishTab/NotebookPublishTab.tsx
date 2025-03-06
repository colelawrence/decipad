/* eslint-disable complexity */
/* eslint-disable decipad/css-prop-named-variable */
/* eslint-disable camelcase */
import { CaretDown, Check, Globe, Link, Lock, World } from '../../../icons';
import {
  Button,
  Dot,
  SidebarIcon,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Tooltip,
} from '../../../shared';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FC, ReactNode, useState } from 'react';

import { useCurrentWorkspaceStore } from '@decipad/react-contexts';

import * as S from './styles';
import { PublishControls } from './PublishControls';
import { aliasInputStyles } from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { Publish_State } from '@decipad/graphql-client';
import * as Popover from '@radix-ui/react-popover';
import { analytics } from '@decipad/client-events';

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
  link,
  onUpdatePublish,
  onPublish,
  onUpdateAllowDuplicate,
  onAddAlias,
  allowDuplicate,
  isPremium,
  currentSnapshot,
}) => {
  const isPublic = publishingState === 'PUBLICLY_HIGHLIGHTED';
  // hmmm this is counter-intuitive
  const isPrivate = publishingState === 'PUBLIC';

  const [linkTypeTab, setLinkTypeTab] = useState<'public' | 'private'>(
    isPremium ? 'private' : 'public'
  );

  const [aliasName, setAliasName] = useState('');

  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  const isPublished = publishingState !== 'PRIVATE';

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
          {isFlagEnabled('PRIVATE_LINK_ANALYTICS') ? (
            <TabsRoot defaultValue={linkTypeTab} onValueChange={setLinkTypeTab}>
              <TabsList fullWidth>
                <TabsTrigger
                  testId="public-link-tab"
                  name="public"
                  trigger={{
                    children: (
                      <SidebarIcon
                        description={'Public Link'}
                        icon={<Globe />}
                      />
                    ),
                    label: 'Public',
                    disabled: false,
                  }}
                />
                <TabsTrigger
                  testId="private-link-tab"
                  name="private"
                  trigger={{
                    children: (
                      <SidebarIcon
                        description={'Private Link'}
                        icon={<Lock />}
                      />
                    ),
                    label: 'Private',
                    disabled: false,
                  }}
                />
              </TabsList>
              <TabsContent name="public">
                <S.TabContents>
                  <S.TabDescription>
                    Anyone can view this notebook. It can appear in search
                    engine results and in the notebook gallery on our website.
                  </S.TabDescription>
                  <PublishControls
                    notebookId={notebookId}
                    allowDuplicate={allowDuplicate}
                    publishedStatus={publishingState}
                    onChangeAllowDuplicate={onUpdateAllowDuplicate}
                  />
                  {isAdmin && (
                    <>
                      {!isPublic && (
                        <Button
                          type="tertiaryAlt"
                          onClick={() => {
                            onUpdatePublish(notebookId, 'PUBLICLY_HIGHLIGHTED');
                          }}
                        >
                          Make link public
                        </Button>
                      )}
                      {isPublic && (
                        <>
                          <Button
                            type="danger"
                            onClick={() => {
                              onUpdatePublish(notebookId, 'PRIVATE');
                            }}
                          >
                            Delete public link
                          </Button>

                          {publishedVersionState !== 'up-to-date' && (
                            <Button
                              type="primaryBrand"
                              onClick={() => {
                                onPublish(notebookId);
                              }}
                            >
                              {publishedVersionState === 'first-time-publish' &&
                                'Publish link'}

                              {publishedVersionState ===
                                'unpublished-changes' && 'Publish changes'}
                            </Button>
                          )}
                          {publishedVersionState !== 'first-time-publish' && (
                            <CopyToClipboard
                              text={link}
                              options={{ format: 'text/plain' }}
                              onCopy={() => {
                                // Analytics
                                analytics.track({
                                  type: 'action',
                                  action: 'Notebook Share Link Copied',
                                  props: {
                                    analytics_source: 'frontend',
                                  },
                                });
                              }}
                            >
                              <Button
                                testId="copy-published-link"
                                type="tertiaryAlt"
                              >
                                Copy link
                              </Button>
                            </CopyToClipboard>
                          )}
                        </>
                      )}
                    </>
                  )}
                </S.TabContents>
              </TabsContent>
              <TabsContent name="private">
                <S.TabContents>
                  <S.TabDescription>
                    Only people with the link can view this document. You can
                    gather basic analytics on who views the document.
                  </S.TabDescription>
                  <PublishControls
                    notebookId={notebookId}
                    allowDuplicate={allowDuplicate}
                    publishedStatus={publishingState}
                    onChangeAllowDuplicate={onUpdateAllowDuplicate}
                  />

                  {isAdmin && (
                    <>
                      {!isPrivate && (
                        <Button
                          type="tertiaryAlt"
                          onClick={() => {
                            onUpdatePublish(notebookId, 'PUBLIC');
                          }}
                        >
                          Make link private
                        </Button>
                      )}
                      {isPrivate && (
                        <>
                          <Button
                            type="danger"
                            onClick={() => {
                              onUpdatePublish(notebookId, 'PRIVATE');
                            }}
                          >
                            Delete private link
                          </Button>

                          {publishedVersionState !== 'up-to-date' && (
                            <Button
                              type="primaryBrand"
                              onClick={() => {
                                onPublish(notebookId);
                              }}
                            >
                              {publishedVersionState === 'first-time-publish' &&
                                'Publish link'}

                              {publishedVersionState ===
                                'unpublished-changes' && 'Publish changes'}
                            </Button>
                          )}
                          {publishedVersionState !== 'first-time-publish' && (
                            <CopyToClipboard
                              text={link}
                              options={{ format: 'text/plain' }}
                              onCopy={() => {
                                // Analytics
                                analytics.track({
                                  type: 'action',
                                  action: 'Notebook Share Link Copied',
                                  props: {
                                    analytics_source: 'frontend',
                                  },
                                });
                              }}
                            >
                              <Button
                                testId="copy-published-link"
                                type="tertiaryAlt"
                              >
                                Copy link
                              </Button>
                            </CopyToClipboard>
                          )}

                          <input
                            type="text"
                            css={aliasInputStyles}
                            value={aliasName}
                            onChange={(e) => setAliasName(e.target.value)}
                          />
                          <Button
                            type="tertiaryAlt"
                            onClick={() => onAddAlias(notebookId, aliasName)}
                            disabled={!aliasName || aliasName.length < 3}
                          >
                            Add alias
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </S.TabContents>
              </TabsContent>
            </TabsRoot>
          ) : (
            <>
              <S.BasicGap css={S.HackyButNeededZIndexStyles}>
                <Popover.Root open={open} onOpenChange={setOpen}>
                  <Popover.Trigger>
                    <div css={S.triggerStyles} data-testid="publish-dropdown">
                      <div css={S.triggerTitleIconStyles}>
                        {PublishingIconMap[publishingState]}
                        {PublishingTextMap[publishingState]}
                      </div>
                      {isAdmin && <CaretDown />}
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
                            This notebook is only accessible to collaborators
                            and workspace members.
                          </span>
                        </div>
                        {publishingState === 'PRIVATE' && <Check />}
                      </div>

                      <div
                        css={S.publishMode}
                        aria-selected={
                          publishingState === 'PUBLICLY_HIGHLIGHTED'
                        }
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
                        {publishingState === 'PUBLICLY_HIGHLIGHTED' && (
                          <Check />
                        )}
                      </div>

                      <div
                        css={S.publishMode}
                        aria-selected={publishingState === 'PUBLIC'}
                        data-testid="publish-private-url"
                        onClick={() => {
                          if (isPremium) {
                            setOpen(false);
                            onUpdatePublish(notebookId, 'PUBLIC');
                          } else {
                            setIsUpgradeWorkspaceModalOpen(true);
                          }
                        }}
                      >
                        <div>
                          <p>
                            {PublishingIconMap.PUBLIC}
                            {PublishingTextMap.PUBLIC}
                            {!isPremium && (
                              <S.Badge data-testid="upgrade-badge">
                                Upgrade
                              </S.Badge>
                            )}
                          </p>
                          <span>
                            Only people you share the link with can view this
                            document. It will not show up in search engines or
                            on your profile, or in the notebook gallery on our
                            website.{' '}
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
                              !open && (
                                <Dot noBorder size={8} position="relative" />
                              )}
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
                                    analytics.track({
                                      type: 'action',
                                      action: 'Notebook Share Link Copied',
                                      props: {
                                        analytics_source: 'frontend',
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
            </>
          )}
        </>
      )}
    </div>
  );
};
