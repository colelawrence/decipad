import { Meta, StoryFn } from '@storybook/react';
import {
  NotebookPublishingPopUp,
  NotebookSharingPopUpProps,
} from './NotebookPublishingPopUp';
import { noop } from '@decipad/utils';

const args: NotebookSharingPopUpProps = {
  onPublish: async () => {},
  snapshots: [],
  workspaceId: 'workspace id',
  notebookId: 'notebook id',
  notebookName: 'notebookName',
  onChange: noop as any,
  onInvite: noop as any,
  onRemove: noop as any,
  onUpdatePublish: noop as any,
  onRestore: noop as any,
  hasUnpublishedChanges: 'unpublished-changes',
  isPremium: false,
  publishingState: 'PRIVATE',
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

export const Republish: StoryFn<typeof args> = (props) => (
  <NotebookPublishingPopUp {...props} />
);
