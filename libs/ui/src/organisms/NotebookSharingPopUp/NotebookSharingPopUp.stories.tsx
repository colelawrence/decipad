import { Meta, Story } from '@storybook/react';
import { NotebookSharingPopUp } from './NotebookSharingPopUp';

const args = {
  isShared: true,
};

export default {
  title: 'Organisms / Notebook / Sharing Pop Up',
  component: NotebookSharingPopUp,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = ({ isShared }) => (
  <NotebookSharingPopUp
    notebook={{ id: 'nbid', name: 'My notebook' }}
    sharingSecret={isShared ? 'secret' : undefined}
  />
);
