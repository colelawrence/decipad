import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';

export default {
  title: 'Templates / Dashboard / Sidebar',
  component: DashboardSidebar,
} as Meta;

export const Normal: Story = () => (
  <DashboardSidebar
    name="John Doe"
    email="john.doe@example.com"
    onOpenSettings={noop}
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', id: '42', numberOfMembers: 1 }}
    allWorkspaces={[]}
  />
);
