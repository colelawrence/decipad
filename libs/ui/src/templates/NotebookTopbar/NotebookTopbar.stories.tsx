import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';
import { noop } from '@decipad/utils';

const args: Omit<ComponentProps<typeof NotebookTopbar>, 'workspaceHref'> = {
  workspace: { id: 'wsid', name: "John's Workspace" },
  notebook: {
    id: 'nbid',
    name: 'My first notebook',
  },
  usersWithAccess: [
    {
      user: { id: '1', name: 'John Doe', email: 'foo@nar.com' },
      permission: 'ADMIN',
    },
  ],
  permission: 'ADMIN',
  sidebarOpen: true,
  status: 'draft',
  onChangeStatus: noop,
  isArchived: false,
  isReadOnly: false,
  canUndo: true,
  canRedo: true,
  onUndo: noop,
  onRedo: noop,
  notebookId: '',
  onDuplicate: noop as any,
  onExport: noop,
  onExportBackups: noop,
  onUnarchive: noop,
  onDelete: noop,
  isNewNotebook: true,
  onClearAll: noop,
  onMoveWorkspace: noop,
  workspaces: [],
};
export default {
  title: 'Templates / Notebook / Top Bar / Topbar',
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookTopbar {...props} />
);
