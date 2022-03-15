import { Meta, Story } from '@storybook/react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export default {
  title: 'Organisms / Workspaces / Switcher',
  component: WorkspaceSwitcher,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceSwitcher
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', href: '', numberOfMembers: 1 }}
    otherWorkspaces={[
      { id: '0', name: 'Other Workspace', href: '', numberOfMembers: 2 },
    ]}
  />
);
