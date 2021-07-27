import { Meta, Story } from '@storybook/react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

const args = {
  numberOfOtherWorkspaces: 2,
};

export default {
  title: 'Organisms / Workspaces / Switcher',
  component: WorkspaceSwitcher,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfOtherWorkspaces }) => (
  <WorkspaceSwitcher
    Heading="h1"
    activeWorkspace={{ name: 'Active Workspace', href: '', numberOfMembers: 1 }}
    otherWorkspaces={Array(numberOfOtherWorkspaces)
      .fill(null)
      .map((_, i) => ({
        id: String(i),
        name: `Workspace ${i + 1}`,
        href: '',
        numberOfMembers: 2,
      }))}
  />
);
