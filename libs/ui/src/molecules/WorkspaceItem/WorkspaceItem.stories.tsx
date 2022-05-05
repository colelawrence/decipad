import { Meta, Story } from '@storybook/react';
import { WorkspaceItem } from './WorkspaceItem';

const args = {
  name: "John Doe's Workspace",
  numberOfMembers: 1,
};
export default {
  title: 'Molecules / UI / Workspace / Item',
  component: WorkspaceItem,
  args,
} as Meta;

export const Normal: Story<typeof args> = (currentArgs) => (
  <WorkspaceItem href="" {...currentArgs} />
);
