import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Organisms / Workspaces / Switcher',
  component: WorkspaceSwitcher,
  decorators: [(story) => <div style={{ padding: '0 8px' }}>{story()}</div>],
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
