import { Meta } from '@storybook/react';
import { WorkspaceItem } from './WorkspaceItem';

const args = {
  name: "John Doe's Workspace",
  numberOfMembers: 1,
};
export default {
  title: 'Molecules / Workspaces / Item',
  component: WorkspaceItem,
  decorators: [(story) => <div style={{ padding: '0 8px' }}>{story()}</div>],
  args,
} as Meta;

export const Normal = (currentArgs: typeof args) => (
  <WorkspaceItem href="" {...currentArgs} />
);
