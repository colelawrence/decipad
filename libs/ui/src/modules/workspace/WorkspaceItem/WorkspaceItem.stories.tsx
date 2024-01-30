import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceItem } from './WorkspaceItem';

const args = {
  id: '42',
  name: "John Doe's Workspace",
  membersCount: 1,
};
export default {
  title: 'Molecules / UI / Workspace / Item',
  component: WorkspaceItem,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (currentArgs) => (
  <WorkspaceItem {...currentArgs} />
);
