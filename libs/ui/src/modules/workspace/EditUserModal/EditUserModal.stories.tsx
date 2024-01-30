import { Meta, StoryFn } from '@storybook/react';
import { EditUserModal } from './EditUserModal';

const args = {};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit User Modal',
  component: EditUserModal,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = () => <EditUserModal />;
