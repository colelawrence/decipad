import { Meta, Story } from '@storybook/react';
import { NotebookPublishingPopUp } from './NotebookPublishingPopUp';

const args = {
  notebook: {
    id: 'nbid',
    name: 'My notebook',
  },
  hasLocalChanges: false,
  isPublished: false,
};

export default {
  title: 'Organisms / UI / Publish / Button',
  component: NotebookPublishingPopUp,
  args,
  argTypes: {
    onToggleMakePublic: {
      action: true,
    },
  },
} as Meta<typeof args>;

export const Unpublished: Story<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);

export const Published: Story<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);
Published.args = {
  isPublished: true,
};

export const Republish: Story<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);
Republish.args = {
  hasLocalChanges: true,
  isPublished: true,
};
