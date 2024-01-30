import { Meta, StoryFn } from '@storybook/react';
import { EditWorkspaceModal } from './EditWorkspaceModal';

const args = {
  name: 'Workspace Name',
  allowDelete: true,
};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit Workspace Modal',
  component: EditWorkspaceModal,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <EditWorkspaceModal {...props} Heading="h1" closeHref="" membersHref="" />
);
