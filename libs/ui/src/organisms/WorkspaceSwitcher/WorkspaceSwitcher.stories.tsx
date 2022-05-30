import { Meta, Story } from '@storybook/react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export default {
  title: 'Organisms / UI / Workspace / Switcher',
  component: WorkspaceSwitcher,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceSwitcher
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', id: '42', numberOfMembers: 1 }}
    otherWorkspaces={[{ id: '0', name: 'Other Workspace', numberOfMembers: 2 }]}
  />
);
