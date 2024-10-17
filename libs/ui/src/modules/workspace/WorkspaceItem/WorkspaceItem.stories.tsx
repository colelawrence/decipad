import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceItem, WorkspaceItemProps } from './WorkspaceItem';
import { noop } from '@decipad/utils';

const args = {
  id: '42',
  name: "John Doe's Workspace",
  isActive: true,
  isPremium: false,
  membersCount: 1,
  onSelect: noop,
};
export default {
  title: 'Molecules / UI / Workspace / Item',
  component: WorkspaceItem,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (
  currentArgs: WorkspaceItemProps
) => <WorkspaceItem {...currentArgs} />;
