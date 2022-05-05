import { Meta, Story } from '@storybook/react';
import { Modal } from './Modal';

const args = {
  children: 'Content',
};

export default {
  title: 'Molecules / UI / Modal',
  component: Modal,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Modal {...props} />;
