import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceSelector } from './WorkspaceSelector';

export default {
  title: 'Organisms / UI / Workspace / Selector',
  component: WorkspaceSelector,
} as Meta;

export const Normal: StoryFn = () => (
  <WorkspaceSelector
    activeWorkspace={{ name: 'Active Workspace', id: '42', numberOfMembers: 1 }}
    allWorkspaces={[{ id: '0', name: 'Other Workspace', numberOfMembers: 2 }]}
  />
);
