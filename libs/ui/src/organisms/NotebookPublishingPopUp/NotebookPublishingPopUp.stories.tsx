import { Meta, StoryFn } from '@storybook/react';
import { NotebookPublishingPopUp } from './NotebookPublishingPopUp';

const args = {
  notebook: {
    id: 'nbid',
    name: 'My notebook',
    snapshots: [{ createdAt: '1970-01-20T07:09:01.191Z' }],
  },
  hasUnpublishedChanges: false,
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

export const Unpublished: StoryFn<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);

export const Published: StoryFn<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);
Published.args = {
  isPublished: true,
};

export const Republish: StoryFn<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);
Republish.args = {
  hasUnpublishedChanges: true,
  isPublished: true,
};
