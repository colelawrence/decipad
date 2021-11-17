import { Meta, Story } from '@storybook/react';
import { sidePadding } from '../../storybook-utils';
import { NotebookAvatar } from './NotebookAvatar';

export default {
  title: 'Molecules / Notebook / Avatar',
  component: NotebookAvatar,
  args: {
    name: 'John Doe',
  },
  decorators: [sidePadding(6)],
} as Meta;

export const Normal: Story<{ name: string; permission: string }> = (props) => (
  <NotebookAvatar {...props} />
);
Normal.args = {
  permission: 'Viewer',
};

export const Admin: Story<{ name: string; permission: string }> = (props) => (
  <NotebookAvatar {...props} />
);
Admin.args = {
  permission: 'Admin',
};
