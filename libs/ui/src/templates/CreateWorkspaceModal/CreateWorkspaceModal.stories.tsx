import { Meta, Story } from '@storybook/react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export default {
  title: 'Templates / Dashboard / Sidebar / Create Workspace Modal',
  component: CreateWorkspaceModal,
} as Meta;

export const Normal: Story = () => (
  <CreateWorkspaceModal Heading="h1" closeHref="" />
);
