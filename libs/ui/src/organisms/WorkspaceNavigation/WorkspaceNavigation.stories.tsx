import { Meta, Story } from '@storybook/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export default {
  title: 'Organisms / UI / Workspace / Navigation',
  component: WorkspaceNavigation,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceNavigation activeWorkspace={{ id: '42' }} />
);
