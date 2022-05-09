import { Meta, Story } from '@storybook/react';
import { EditWorkspaceModal } from './EditWorkspaceModal';

const args = {
  name: 'Workspace Name',
  allowDelete: true,
};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit Workspace Modal',
  component: EditWorkspaceModal,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <EditWorkspaceModal {...props} Heading="h1" closeHref="" />
);
