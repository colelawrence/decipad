import { Meta, StoryFn } from '@storybook/react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { noop } from '@decipad/utils';

export default {
  title: 'Templates / Dashboard / Sidebar / Create Workspace Modal',
  component: CreateWorkspaceModal,
} as Meta;

export const Normal: StoryFn = () => <CreateWorkspaceModal onClose={noop} />;
