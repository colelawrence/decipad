import { Meta, StoryFn } from '@storybook/react';
import {
  EditWorkspaceModal,
  EditWorkspaceModalProps,
} from './EditWorkspaceModal';
import { noop } from '@decipad/utils';

const args = {
  name: 'Workspace Name',
  allowDelete: true,
};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit Workspace Modal',
  component: EditWorkspaceModal,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (
  props: EditWorkspaceModalProps
) => <EditWorkspaceModal {...props} onClose={noop} membersHref="" />;
