import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { DashboardSidebar } from './DashboardSidebar';

export default {
  title: 'Templates / Dashboard / Sidebar',
  component: DashboardSidebar,
} as Meta;

export const Normal: StoryFn = () => (
  <DashboardSidebar
    name="John Doe"
    email="john.doe@example.com"
    onDeleteSection={noop}
    onUpdateSection={() => new Promise(noop)}
    onCreateSection={() => new Promise(noop)}
    onCreateWorkspace={() => new Promise(noop)}
    onNavigateWorkspace={noop}
    onShowFeedback={noop}
    onLogout={noop}
    workspaces={[]}
  />
);
