import { Meta, Story } from '@storybook/react';
import { WorkspaceLogo } from './WorkspaceLogo';

export default {
  title: 'Organisms / UI / Workspace / Settings',
  component: WorkspaceLogo,
} as Meta;

export const Normal: Story = () => (
  <WorkspaceLogo
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
