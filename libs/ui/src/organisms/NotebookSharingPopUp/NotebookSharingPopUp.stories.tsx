import { Meta, Story } from '@storybook/react';
import { NotebookSharingPopUp } from './NotebookSharingPopUp';

const args = {
  notebook: {
    id: 'nbid',
    name: 'My notebook',
  },
  isPublic: true,
};

export default {
  title: 'Organisms / UI / Share / Button',
  component: NotebookSharingPopUp,
  args,
  argTypes: {
    onToggleMakePublic: {
      action: true,
    },
  },
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <NotebookSharingPopUp {...props} />
);
