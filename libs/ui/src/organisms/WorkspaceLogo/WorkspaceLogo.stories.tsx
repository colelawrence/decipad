import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceLogo } from './WorkspaceLogo';

export default {
  title: 'Organisms / UI / Workspace / Logo',
  component: WorkspaceLogo,
} as Meta;

export const Normal: StoryFn = () => (
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
