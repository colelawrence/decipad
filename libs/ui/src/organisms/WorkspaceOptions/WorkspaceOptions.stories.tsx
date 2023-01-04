import { Meta, Story } from '@storybook/react';
import { WorkspaceOptions } from './WorkspaceOptions';

export default {
  title: 'Organisms / UI / Workspace / Settings',
  component: WorkspaceOptions,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceOptions
    Heading="h1"
    activeWorkspace={{
      name: 'Active Workspace',
      id: '42',
      numberOfMembers: 1,
      sections: [],
    }}
    allWorkspaces={[{ id: '0', name: 'Other Workspace', numberOfMembers: 2 }]}
  />
);
