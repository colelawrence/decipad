import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

import { Caret } from '../../../icons';
import { UndoButtons } from './UndoButtons';
import { NotebookOptions } from '../NotebookOptions/NotebookOptions';
import { NotebookPath } from '../NotebookPath/NotebookPath';
import { NotebookStatusDropdown } from '../NotebookStatus/NotebookStatusDropdown';
import { AIModeSwitch } from '../AIModeSwitch/AIModeSwitch';
import { NotebookPublishingPopUp } from '../NotebookPublishingPopUp/NotebookPublishingPopUp';

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
          <Caret variant="down" />
        </div>
      }
      notebookStatus={
        <NotebookStatusDropdown status="done" onChangeStatus={() => {}} />
      }
      actions={{
        onChangeStatus: () => {},
        onMoveToSection: () => {},
        onDeleteNotebook: () => {},
        onMoveToWorkspace: () => {},
        onDownloadNotebook: () => {},
        onDuplicateNotebook: async () => true,
        onUnarchiveNotebook: () => {},
        onDownloadNotebookHistory: () => {},
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
    />
  ),
  access: {
    isAuthenticated: true,
    isSharedNotebook: false,
    hasWorkspaceAccess: true,
    permissionType: 'ADMIN',
    isGPTGenerated: false,
  },
  actions: {
    onBack: () => {},
    onGalleryClick: () => {},
    onToggleSidebar: () => {},
    onTryDecipadClick: () => {},
    onClaimNotebook: () => {},
    onDuplicateNotebook: () => {},
    isSidebarOpen: false,
  },
  authors: {
    adminName: 'Me',
    invitedUsers: [],
    isWriter: true,
  },
  isEmbed: false,
  status: 'done',
};

export default {
  title: 'Templates / Notebook / Top Bar / Topbar',
  args,
} as Meta;

export const Writer: StoryFn<typeof args> = (props) => (
  <NotebookTopbar {...props} />
);

export const GPTGenerated: StoryFn<typeof args> = (props) => (
  <NotebookTopbar
    {...props}
    access={{ ...props.access, isGPTGenerated: true }}
  />
);

export const Embed: StoryFn<typeof args> = (props) => (
  <NotebookTopbar {...props} isEmbed={true} />
);

export const Reader: StoryFn<typeof args> = (props) => (
  <NotebookTopbar
    {...props}
    access={{ ...props.access, permissionType: 'READ' }}
  />
);
