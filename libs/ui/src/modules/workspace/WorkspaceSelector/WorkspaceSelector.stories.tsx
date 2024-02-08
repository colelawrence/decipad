import { Meta, StoryFn } from '@storybook/react';
import { WorkspaceSelector } from './WorkspaceSelector';

export default {
  title: 'Organisms / UI / Workspace / Selector',
  component: WorkspaceSelector,
} as Meta;

export const Free: StoryFn = () => (
  <WorkspaceSelector
    name="Free Workspace"
    membersCount={1}
    isPremium={false}
    MenuComponent={null}
  />
);

export const Premium: StoryFn = () => (
  <WorkspaceSelector
    name="Premium Workspace"
    membersCount={5}
    isPremium={true}
    MenuComponent={null}
  />
);
