import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceMenu } from './WorkspaceMenu';

const args = {
  numberOfallWorkspaces: 2,
};

export default {
  title: 'Organisms / UI / Workspace / Menu',
  component: WorkspaceMenu,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = ({ numberOfallWorkspaces }) => (
  <WorkspaceMenu
    Heading="h1"
    activeWorkspace={{
      name: 'Active Workspace',
      id: '42',
      membersCount: 1,
      sections: [],
    }}
    allWorkspaces={Array(numberOfallWorkspaces)
      .fill(null)
      .map((_, i) => ({
        id: String(i),
        name: `Workspace ${i + 1}`,
        href: '',
        membersCount: 2,
      }))}
  />
);
