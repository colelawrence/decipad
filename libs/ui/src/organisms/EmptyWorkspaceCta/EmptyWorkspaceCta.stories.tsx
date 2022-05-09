import { Meta, Story } from '@storybook/react';
import { EmptyWorkspaceCta } from './EmptyWorkspaceCta';

export default {
  title: 'Organisms / UI / Workspace / Empty Workspace CTA',
  component: EmptyWorkspaceCta,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story = () => <EmptyWorkspaceCta Heading="h1" />;
Normal.storyName = 'Empty Workspace CTA';
