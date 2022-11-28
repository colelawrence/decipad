import { Meta, Story } from '@storybook/react';
import { WorkspaceMenu } from './WorkspaceMenu';

const args = {
  numberOfallWorkspaces: 2,
};

export default {
  title: 'Organisms / UI / Workspace / Menu',
  component: WorkspaceMenu,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfallWorkspaces }) => (
  <WorkspaceMenu
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', id: '42', numberOfMembers: 1 }}
    allWorkspaces={Array(numberOfallWorkspaces)
      .fill(null)
      .map((_, i) => ({
        id: String(i),
        name: `Workspace ${i + 1}`,
        href: '',
        numberOfMembers: 2,
      }))}
  />
);
