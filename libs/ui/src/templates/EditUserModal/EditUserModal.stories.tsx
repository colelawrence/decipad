import { Meta, Story } from '@storybook/react';
import { EditUserModal } from './EditUserModal';

const emptyPromise = Promise.resolve;
const args = {
  name: 'Aspen Vaccaro',
  username: '@aspen',
  onChangeName: emptyPromise,
  onChangeUsername: emptyPromise,
  onClose: emptyPromise,
};

export default {
  title: 'Templates / Dashboard / Sidebar / Edit User Modal',
  component: EditUserModal,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <EditUserModal {...props} />
);
