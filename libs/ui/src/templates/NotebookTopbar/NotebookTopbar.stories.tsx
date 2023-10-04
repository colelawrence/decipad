import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';
import { noop } from '@decipad/utils';

const args: Omit<ComponentProps<typeof NotebookTopbar>, 'workspaceHref'> = {
  sidebarOpen: true,
  canRedo: true,
  canUndo: true,
  onUndo: noop,
  onRedo: noop,
  isNewNotebook: true,
  onClearAll: noop,
  isEmbed: false,
  toggleSidebar: noop,
  notebookMeta: undefined,
  notebookMetaActions: {
    onChangeStatus: noop,
    onMoveToSection: noop,
    onDeleteNotebook: noop,
    onMoveToWorkspace: noop,
    onPublishNotebook: noop as any,
    onDownloadNotebook: noop,
    onDuplicateNotebook: noop as any,
    onUnarchiveNotebook: noop,
    onUnpublishNotebook: noop as any,
    onDownloadNotebookHistory: noop,
  },
  notebookAccessActions: {
    onChangeAccess: noop as any,
    onRemoveAccess: noop as any,
    onInviteByEmail: noop as any,
  },
  userWorkspaces: [],
  hasUnpublishedChanges: false,
  toggleAIMode: noop,
  aiMode: false,
};
export default {
  title: 'Templates / Notebook / Top Bar / Topbar',
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookTopbar {...props} />
);
