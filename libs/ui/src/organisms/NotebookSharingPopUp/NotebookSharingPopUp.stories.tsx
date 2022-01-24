import { Meta, Story } from '@storybook/react';
import {
  NotebookSharingPopUp,
  NotebookSharingPopUpProps,
} from './NotebookSharingPopUp';

const args: NotebookSharingPopUpProps = {
  link: 'peanut-butter-jelly-time-peanut-',
};

export default {
  title: 'Organisms / Notebook / Sharing Pop Up',
  component: NotebookSharingPopUp,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <NotebookSharingPopUp {...props} />
);
