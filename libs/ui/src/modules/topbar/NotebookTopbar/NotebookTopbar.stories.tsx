import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

import { CaretDown } from '../../../icons';
import { AIModeSwitch } from '../AIModeSwitch/AIModeSwitch';
import { NotebookOptions } from '../NotebookOptions/NotebookOptions';
import { NotebookPath } from '../NotebookPath/NotebookPath';
import { NotebookPublishingPopUp } from '../NotebookPublishingPopUp/NotebookPublishingPopUp';
import { NotebookStatusDropdown } from '../NotebookStatus/NotebookStatusDropdown';
import { UndoButtons } from './UndoButtons';
import { TopbarGenericProps } from './types';

const notebookId = 'notebookId';
const notebookName = 'my notebook';
const workspaceId = 'workspace id';

// We can't import MenuItemButton from 'styles' without crashing storybook.
// pretty weird.

const args: ComponentProps<typeof NotebookTopbar> = {
  NotebookOptions: (
    <NotebookOptions
      notebookId={notebookId}
      canDelete={false}
      permissionType="ADMIN"
      isArchived={false}
      workspaces={[]}
      onDuplicate={() => {}}
      trigger={
        <div
          // eslint-disable-next-line decipad/css-prop-named-variable
          css={{
            cursor: 'pointer',
            userSelect: 'none',
            'div em': {
              cursor: 'pointer',
              userSelect: 'none',
            },
          }}
        >
          <NotebookPath concatName notebookName={notebookName} />
          <CaretDown />
        </div>
      }
      notebookStatus={
        <NotebookStatusDropdown
          status="done"
          onChangeStatus={() => {}}
          permissionType={undefined}
        />
      }
      actions={{
        onChangeStatus: () => {},
        onMoveToSection: () => {},
        onDeleteNotebook: () => {},
        onMoveToWorkspace: () => {},
        onDownloadNotebook: () => {},
        onDuplicateNotebook: async () => true,
        onUnarchiveNotebook: () => {},
        onDownloadNotebookHistory: async () => {},
        onUpdatePublishState: async () => {},
        onPublishNotebook: async () => {},
        onUpdateAllowDuplicate: async () => {},
        onAddAlias: async () => {},
        onRemoveAlias: async () => {},
      }}
      creationDate={new Date()}
      workspaceId={workspaceId}
    />
  ),
  UndoButtons: (
    <UndoButtons
      canUndo={true}
      canRedo={true}
      isEmbed={false}
      onRedo={() => {}}
      onUndo={() => {}}
      onRevertChanges={() => {}}
    />
  ),
  AiModeSwitch: <AIModeSwitch value={false} onChange={() => {}} />,
  NotebookPublishing: (
    <NotebookPublishingPopUp
      notebookName={notebookName}
      workspaceId={workspaceId}
      hasPaywall={false}
      invitedUsers={[]}
      nrOfTeamMembers={1}
      manageTeamURL="abc"
      teamName="Decipad"
      isAdmin={true}
      snapshots={[]}
      notebookId={notebookId}
      publishedVersionState="up-to-date"
      onUpdatePublish={async () => {}}
      onInvite={async () => {}}
      onChange={async () => {}}
      onRemove={async () => {}}
      onPublish={async () => {}}
      publishingState={'PRIVATE'}
      isPremium={false}
      selectedTab="publishing"
      onChangeSelectedTab={() => {}}
      allowDuplicate={false}
      onUpdateAllowDuplicate={async () => {}}
      onAddAlias={async () => {}}
      onRemoveAlias={async () => {}}
    />
  ),
  access: {
    isAuthenticated: true,
    isSharedNotebook: false,
    hasWorkspaceAccess: true,
    permissionType: 'ADMIN',
    isGPTGenerated: false,
    isDuplicateAllowed: true,
  },
  actions: {
    onBack: () => {},
    onGalleryClick: () => {},
    onToggleSidebar: () => {},
    onTryDecipadClick: () => {},
    onClaimNotebook: () => {},
    onDuplicateNotebook: () => {},
    onToggleAnnotations: () => {},
    isSidebarOpen: false,
  },
  authors: {
    adminName: 'Me',
    invitedUsers: [],
    isWriter: true,
  },
  isEmbed: false,
  status: 'done',
  notebookName: 'fooo',
};

export default {
  title: 'Templates / Notebook / Top Bar / Topbar',
  args,
} as Meta;

export const Writer: StoryFn<typeof args> = (props: TopbarGenericProps) => (
  <NotebookTopbar {...props} />
);

export const GPTGenerated: StoryFn<typeof args> = (
  props: TopbarGenericProps
) => (
  <NotebookTopbar
    {...props}
    access={{ ...props.access, isGPTGenerated: true }}
  />
);

export const Embed: StoryFn<typeof args> = (props: TopbarGenericProps) => (
  <NotebookTopbar {...props} isEmbed={true} />
);

export const Reader: StoryFn<typeof args> = (props: TopbarGenericProps) => (
  <NotebookTopbar
    {...props}
    access={{ ...props.access, permissionType: 'READ' }}
  />
);
