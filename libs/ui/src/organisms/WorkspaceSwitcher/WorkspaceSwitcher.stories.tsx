import { Meta, Story } from '@storybook/react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { sidePadding } from '../../storybook-utils';

export default {
  title: 'Organisms / Workspaces / Switcher',
  component: WorkspaceSwitcher,
  decorators: [sidePadding(8)],
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
