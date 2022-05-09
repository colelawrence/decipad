import { Meta, Story } from '@storybook/react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export default {
  title: 'Templates / Dashboard / Sidebar / Create Workspace Modal',
  component: CreateWorkspaceModal,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story = () => (
  <CreateWorkspaceModal Heading="h1" closeHref="" />
);
