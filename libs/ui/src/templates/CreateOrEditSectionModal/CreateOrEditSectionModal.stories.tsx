import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { CreateOrEditSectionModal } from './CreateOrEditSectionModal';

export default {
  title: 'Templates / Dashboard / Sidebar / Create Or Edit Section Modal',
  component: CreateOrEditSectionModal,
} as Meta;

export const Normal: Story = () => (
  <CreateOrEditSectionModal onClose={noop} onSubmit={noop} />
);
