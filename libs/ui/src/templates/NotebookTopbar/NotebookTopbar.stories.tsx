import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

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
};
export default {
  title: 'Templates / Notebook / Top Bar / Topbar',
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NotebookTopbar {...props} />
);
