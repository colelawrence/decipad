import { Meta, StoryFn } from '@storybook/react';
import { EmptyWorkspaceCta } from './EmptyWorkspaceCta';

export default {
  title: 'Organisms / UI / Workspace / Empty Workspace CTA',
  component: EmptyWorkspaceCta,
} as Meta;

export const Normal: StoryFn = () => <EmptyWorkspaceCta />;
Normal.storyName = 'Empty Workspace CTA';
