import { Meta, Story } from '@storybook/react';
import { EmptyWorkspaceCta } from './EmptyWorkspaceCta';

export default {
  title: 'Organisms / Workspaces / Empty Workspace CTA',
  component: EmptyWorkspaceCta,
} as Meta;

export const Normal: Story = () => <EmptyWorkspaceCta Heading="h1" />;
Normal.storyName = 'Empty Workspace CTA';
