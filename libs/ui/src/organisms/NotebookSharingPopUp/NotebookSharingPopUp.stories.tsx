import { Meta, Story } from '@storybook/react';
import {
  NotebookSharingPopUp,
  NotebookSharingPopUpProps,
} from './NotebookSharingPopUp';

export default {
  title: 'Organisms / Notebook / Sharing Pop Up',
  component: NotebookSharingPopUp,
  args: {
    link: 'peanut-butter-jelly-time-peanut-',
  },
} as Meta;

export const Normal: Story<NotebookSharingPopUpProps> = (args) => (
  <NotebookSharingPopUp {...args} />
);
