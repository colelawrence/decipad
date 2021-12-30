import { Meta, Story } from '@storybook/react';
import { NotebookPath } from './NotebookPath';

const args = {
  workspaceName: "John's workspace",
  notebookName: 'Use of funds',
  isAdmin: true,
};
export default {
  title: 'Molecules / Notebook / Path',
  component: NotebookPath,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NotebookPath workspaceHref="" {...props} />
);
