/* eslint decipad/css-prop-named-variable: 0 */

import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import * as Popover from '@radix-ui/react-popover';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useState } from 'react';
import { Button, Dot, TabButton } from '../../atoms';
import { cssVar, smallScreenQuery, smallShadow } from '../../primitives';
import {
  NotebookMetaDataFragment,
  UserAccessMetaFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { NotebookCollaborateTab } from '../NotebookCollaborateTab/NotebookCollaborateTab';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { NotebookPublishTab } from '../NotebookPublishTab/NotebookPublishTab';
import { NotebookEmbedTab } from '../NotebookEmbedTab/NotebookEmbedTab';

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

export type NotebookSharingPopUpProps = Pick<
  ComponentProps<typeof NotebookCollaborateTab>,
  'onInvite' | 'onRemove' | 'onChange'
> & {
  readonly snapshots: NotebookMetaDataFragment['snapshots'];
  readonly hasPaywall?: boolean;
  readonly invitedUsers?: UserAccessMetaFragment[] | null;
  readonly teamUsers?: UserAccessMetaFragment[] | null;
  readonly manageTeamURL?: string;
  readonly teamName?: string;
  readonly isAdmin?: boolean;
  readonly onRestore?: () => void;

  readonly notebookId: string;
  readonly notebookName: string;
  readonly isPublished: boolean;
  readonly hasUnpublishedChanges: boolean;
  readonly workspaceId: string;

  readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
  readonly onUnpublish: NotebookMetaActionsReturn['onUnpublishNotebook'];
};

type TabStates = 'Collaborate' | 'Publish' | 'Embed';

const SNAPSHOT_NAME = 'Published 1';

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookPublishingPopUp = ({
  snapshots,
  hasUnpublishedChanges = false,
  hasPaywall,
  invitedUsers,
  teamName,
  teamUsers,
  manageTeamURL,
  workspaceId,
  isAdmin = false,
  notebookName,

  isPublished,
  notebookId,
  onPublish,
  onUnpublish,

  onInvite,
  onRemove,
  onChange,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [selectedTab, setSelectedTab] = useState<TabStates>('Collaborate');

  const [isPublishing, setIsPublishing] = useState(false);

  const selectTab = (tab: TabStates) => {
    setSelectedTab(tab);
  };

  const onToggleShareMenu = useCallback(
    (open: boolean) => {
      if (open) {
        setSelectedTab(hasUnpublishedChanges ? 'Publish' : 'Collaborate');
      }
      setShareMenuOpen(open);
    },
    [hasUnpublishedChanges]
  );

  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const link = isServerSideRendering()
    ? ''
    : new URL(
        notebooks({}).notebook({
          notebook: { id: notebookId, name: notebookName },
        }).$,
        window.location.origin
      ).toString();

  const embedLink = `${link}?embed=true`;

  const toggleMenuOpen = useCallback(() => {
    setShareMenuOpen(!shareMenuOpen);
  }, [shareMenuOpen]);

  const currentSnapshot = snapshots.find(
    (ss) => ss.snapshotName === SNAPSHOT_NAME
  );

  const popoverDiv = (
    <div css={popUpStyles}>
      <div css={innerPopUpStyles}>
        {isAdmin && (
          <Tabs variant fullWidth useGrid>
            <TabButton
              text="Collaborate"
              isSelected={selectedTab === 'Collaborate'}
              onClick={() => {
                selectTab('Collaborate');
              }}
              testId="collaborate-tab"
            />
            <TabButton
              text="Publish"
              isSelected={selectedTab === 'Publish'}
              onClick={() => {
                selectTab('Publish');
              }}
              testId="publish-tab"
            />
            <TabButton
              text="Embed"
              isSelected={selectedTab === 'Embed'}
              onClick={() => {
                selectTab('Embed');
              }}
              testId="embed-tab"
            />
          </Tabs>
        )}

        {isAdmin && selectedTab === 'Collaborate' && (
          <div css={groupStyles} className="notebook-collaborate-tab">
            <NotebookCollaborateTab
              hasPaywall={hasPaywall}
              usersWithAccess={invitedUsers}
              teamUsers={teamUsers}
              teamName={teamName}
              manageTeamURL={manageTeamURL}
              isAdmin={isAdmin}
              workspaceId={workspaceId}
              notebookId={notebookId}
              onRemove={onRemove}
              onInvite={onInvite}
              onChange={onChange}
            />
          </div>
        )}
        {isAdmin && selectedTab === 'Publish' && (
          <div css={groupStyles} className="notebook-publish-tab">
            <NotebookPublishTab
              notebookId={notebookId}
              isAdmin={isAdmin}
              isPublished={isPublished}
              link={link}
              hasUnpublishedChanges={hasUnpublishedChanges}
              currentSnapshot={currentSnapshot}
              isPublishing={isPublishing}
              setIsPublishing={setIsPublishing}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              setShareMenuOpen={setShareMenuOpen}
            />
          </div>
        )}
        {isAdmin && selectedTab === 'Embed' && (
          <div css={groupStyles} className="notebook-embed-tab">
            <NotebookEmbedTab
              isAdmin={isAdmin}
              isPublished={isPublished}
              embedLink={embedLink}
              setShareMenuOpen={setShareMenuOpen}
            />
          </div>
        )}
        {!isAdmin && (
          <>
            <div css={groupStyles} className="notebook-not-admin-tab">
              <NotebookCollaborateTab
                notebookId={notebookId}
                workspaceId={workspaceId}
                hasPaywall={hasPaywall}
                usersWithAccess={invitedUsers}
                teamUsers={teamUsers}
                teamName={teamName}
                manageTeamURL={manageTeamURL}
                isAdmin={isAdmin}
                onRemove={onRemove}
                onInvite={onInvite}
                onChange={onChange}
              />
            </div>
            <div css={groupStyles} className="notebook-not-admin-tab">
              <NotebookPublishTab
                notebookId={notebookId}
                isAdmin={isAdmin}
                isPublished={isPublished}
                link={link}
                hasUnpublishedChanges={hasUnpublishedChanges}
                currentSnapshot={currentSnapshot}
                isPublishing={isPublishing}
                setIsPublishing={setIsPublishing}
                onPublish={onPublish}
                onUnpublish={onUnpublish}
                setShareMenuOpen={setShareMenuOpen}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Popover.Root
      defaultOpen
      open={shareMenuOpen}
      onOpenChange={onToggleShareMenu}
    >
      <Popover.Trigger asChild>
        {isPublished && hasUnpublishedChanges && !isPublishing && isAdmin ? (
          <Button
            type="primaryBrand"
            onClick={toggleMenuOpen}
            testId="publish-button"
          >
            <span css={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <Dot size={4} noBorder position="relative" />
              Share
            </span>
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
