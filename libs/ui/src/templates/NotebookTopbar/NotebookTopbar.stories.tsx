import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookTopbar } from './NotebookTopbar';

const args: Omit<ComponentProps<typeof NotebookTopbar>, 'workspaceHref'> = {
  workspaceName: "John's Workspace",
  notebookName: 'My first notebook',
  users: [
    {
      user: { id: '1', name: 'John Doe' },
      permission: 'ADMIN',
    },
  ],
  permission: 'ADMIN',
  link: 'peanut-butter-jelly-',
};
export default {
  title: 'Templates / Notebook / Topbar',
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NotebookTopbar workspaceHref="" {...props} />
);
