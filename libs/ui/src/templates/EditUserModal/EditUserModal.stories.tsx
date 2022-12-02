import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { EditUserModal } from './EditUserModal';

const args = {
  name: 'Aspen Vaccaro',
  username: '@aspen',
  onChangeName: noop,
  onChangeUsername: noop,
  onClose: noop,
};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit User Modal',
  component: EditUserModal,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <EditUserModal {...props} />
);
