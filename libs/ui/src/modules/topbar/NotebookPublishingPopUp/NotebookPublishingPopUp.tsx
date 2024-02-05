/* eslint decipad/css-prop-named-variable: 0 */

import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { css } from '@emotion/react';
import { ComponentProps, FC, useState } from 'react';
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
import { isFlagEnabled } from '@decipad/feature-flags';

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

    readonly onUpdatePublish: NotebookMetaActionsReturn['onUpdatePublishState'];
    readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
  };

type TabStates = 'Collaborate' | 'Publish' | 'Embed';

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

  onPublish,

  isPremium,
  publishingState,
  notebookId,
  onUpdatePublish,

  onInvite,
  onRemove,
  onChange,
}: NotebookSharingPopUpProps): ReturnType<FC> => {
  const [selectedTab, setSelectedTab] = useState<TabStates>('Collaborate');

  const selectTab = (tab: TabStates) => {
    setSelectedTab(tab);
  };

  const activeTabId = useActiveTabId();

  const link = isServerSideRendering()
    ? ''
    : new URL(
        notebooks({}).notebook(
          isFlagEnabled('TABS')
            ? {
                notebook: { id: notebookId, name: notebookName },
                tab: activeTabId,
              }
            : {
                notebook: { id: notebookId, name: notebookName },
              }
        ).$,
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
                name="Collaborate"
                trigger={{
                  label: 'Collaborate',
                  onClick: () => selectTab('Collaborate'),
                  disabled: false,
                  selected: selectedTab === 'Collaborate',
                }}
              />
              <TabsTrigger
                testId="publish-tab"
                name="Publish"
                trigger={{
                  label: 'Publish',
                  onClick: () => selectTab('Publish'),
                  disabled: false,
                  selected: selectedTab === 'Publish',
                }}
              />
              <TabsTrigger
                testId="embed-tab"
                name="Embed"
                trigger={{
                  label: 'Embed',
                  onClick: () => selectTab('Embed'),
                  disabled: false,
                  selected: selectedTab === 'Embed',
                }}
              />
            </TabsList>
            <TabsContent name="Collaborate">
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
            <TabsContent name="Publish">
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
                />
              </div>
            </TabsContent>
            <TabsContent name="Embed">
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
