/* eslint decipad/css-prop-named-variable: 0 */

import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { cssVar, smallScreenQuery, smallShadow } from '../../../primitives';
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../../../shared';
import {
  NotebookMetaDataFragment,
  UserAccessMetaFragment,
} from '@decipad/graphql-client';
import { useActiveTabId } from '@decipad/editor-hooks';
import {
  NotebookMetaActionsReturn,
  PublishedVersionName,
  PublishedVersionState,
} from '@decipad/interfaces';
import { NotebookCollaborateTab } from '../NotebookCollaborateTab/NotebookCollaborateTab';
import { NotebookPublishTab } from '../NotebookPublishTab/NotebookPublishTab';
import { NotebookEmbedTab } from '../NotebookEmbedTab/NotebookEmbedTab';
import { SidebarPublishingTab } from '@decipad/react-contexts';

/**
 * The parent div styles, this handles the position of the pop up relative to the button.
 */
const popUpStyles = css({
  padding: '16px',
  height: 'fit-content',
  borderRadius: '16px',
  width: '100%',

  [smallScreenQuery]: {
    width: '250px',
  },

  backgroundColor: cssVar('backgroundMain'),
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
  marginTop: '16px',
});

export type NotebookSharingPopUpProps = Pick<
  ComponentProps<typeof NotebookCollaborateTab>,
  'onInvite' | 'onRemove' | 'onChange'
> &
  Pick<
    ComponentProps<typeof NotebookPublishTab>,
    'publishingState' | 'isPremium'
  > & {
    readonly snapshots: NotebookMetaDataFragment['snapshots'];
    readonly hasPaywall?: boolean;
    readonly invitedUsers?: UserAccessMetaFragment[] | null;
    readonly nrOfTeamMembers?: number | null;
    readonly manageTeamURL?: string;
    readonly teamName?: string;
    readonly isAdmin?: boolean;
    readonly onRestore?: () => void;

    readonly notebookId: string;
    readonly notebookName: string;
    readonly publishedVersionState: PublishedVersionState;
    readonly workspaceId: string;
    readonly allowDuplicate: boolean;

    readonly onUpdatePublish: NotebookMetaActionsReturn['onUpdatePublishState'];
    readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
    readonly onUpdateAllowDuplicate: NotebookMetaActionsReturn['onUpdateAllowDuplicate'];

    readonly selectedTab: SidebarPublishingTab;
    readonly onChangeSelectedTab: (tab: SidebarPublishingTab) => void;
  };

const SNAPSHOT_NAME = PublishedVersionName.Published;

/**
 * A component that handles the rendering of the notebook sharing pop up and the toggle logic.
 * @param link The notebook link to be rendered in the text box and copied to the clipboard on button click.
 * @returns The notebook sharing pop up.
 */
export const NotebookPublishingPopUp = ({
  snapshots,
  publishedVersionState,
  hasPaywall,
  invitedUsers,
  teamName,
  nrOfTeamMembers,
  manageTeamURL,
  workspaceId,
  isAdmin = false,
  notebookName,
  allowDuplicate,

  onPublish,

  isPremium,
  publishingState,
  notebookId,
  onUpdatePublish,

  onInvite,
  onRemove,
  onChange,

  selectedTab,
  onChangeSelectedTab,
  onUpdateAllowDuplicate,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const activeTabId = useActiveTabId();

  const link = isServerSideRendering()
    ? ''
    : new URL(
        notebooks({}).notebook({
          notebook: { id: notebookId, name: notebookName },
          tab: activeTabId,
        }).$,
        window.location.origin
      ).toString();

  const embedLink = `${link}?embed=true`;

  const currentSnapshot = snapshots.find(
    (ss) => ss.snapshotName === SNAPSHOT_NAME
  );

  const isPublished = publishingState !== 'PRIVATE';

  return (
    <div css={popUpStyles} data-testid="publishing-sidebar">
      <div css={innerPopUpStyles}>
        {isAdmin && (
          <TabsRoot defaultValue={selectedTab}>
            <TabsList fullWidth>
              <TabsTrigger
                testId="collaborate-tab"
                name="collaborators"
                trigger={{
                  label: 'Collaborate',
                  onClick: () => onChangeSelectedTab('collaborators'),
                  disabled: false,
                  selected: selectedTab === 'collaborators',
                }}
              />
              <TabsTrigger
                testId="publish-tab"
                name="publishing"
                trigger={{
                  label: 'Publish',
                  onClick: () => onChangeSelectedTab('publishing'),
                  disabled: false,
                  selected: selectedTab === 'publishing',
                }}
              />
              <TabsTrigger
                testId="embed-tab"
                name="embed"
                trigger={{
                  label: 'Embed',
                  onClick: () => onChangeSelectedTab('embed'),
                  disabled: false,
                  selected: selectedTab === 'embed',
                }}
              />
            </TabsList>
            <TabsContent name="collaborators">
              <div css={groupStyles} className="notebook-collaborate-tab">
                <NotebookCollaborateTab
                  hasPaywall={hasPaywall}
                  usersWithAccess={invitedUsers}
                  nrOfTeamMembers={nrOfTeamMembers}
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
            </TabsContent>
            <TabsContent name="publishing">
              <div css={groupStyles} className="notebook-publish-tab">
                <NotebookPublishTab
                  isPremium={isPremium}
                  notebookId={notebookId}
                  isAdmin={isAdmin}
                  publishingState={publishingState}
                  link={link}
                  publishedVersionState={publishedVersionState}
                  currentSnapshot={currentSnapshot}
                  onUpdatePublish={onUpdatePublish}
                  onPublish={onPublish}
                  allowDuplicate={allowDuplicate}
                  onUpdateAllowDuplicate={onUpdateAllowDuplicate}
                />
              </div>
            </TabsContent>
            <TabsContent name="embed">
              <div css={groupStyles} className="notebook-embed-tab">
                <NotebookEmbedTab
                  isAdmin={isAdmin}
                  isPublished={isPublished}
                  embedLink={embedLink}
                />
              </div>
            </TabsContent>
          </TabsRoot>
        )}
        {!isAdmin && (
          <>
            <div css={groupStyles} className="notebook-not-admin-tab">
              <NotebookCollaborateTab
                notebookId={notebookId}
                workspaceId={workspaceId}
                hasPaywall={hasPaywall}
                usersWithAccess={invitedUsers}
                nrOfTeamMembers={nrOfTeamMembers}
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
                publishingState={publishingState}
                link={link}
                isPremium={isPremium}
                publishedVersionState={publishedVersionState}
                currentSnapshot={currentSnapshot}
                onUpdatePublish={onUpdatePublish}
                onPublish={onPublish}
                allowDuplicate={allowDuplicate}
                onUpdateAllowDuplicate={onUpdateAllowDuplicate}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
