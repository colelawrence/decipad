import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { CreateOrEditSectionModal } from './CreateOrEditSectionModal';

export default {
  title: 'Templates / Dashboard / Sidebar / Create Or Edit Section Modal',
  component: CreateOrEditSectionModal,
} as Meta;

export const Normal: StoryFn = () => (
  <CreateOrEditSectionModal onClose={noop} onSubmit={noop} />
);
