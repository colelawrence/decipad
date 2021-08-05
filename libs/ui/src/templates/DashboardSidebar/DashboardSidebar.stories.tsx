import { Meta, Story } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';

export default {
  title: 'Templates / Dashboard / Sidebar',
  component: DashboardSidebar,
} as Meta;

export const Normal: Story = () => (
  <DashboardSidebar
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', href: '', numberOfMembers: 1 }}
    otherWorkspaces={[]}
    allNotebooksHref=""
    preferencesHref=""
  />
);
