import { Meta, StoryFn } from '@storybook/react';
import { Modal } from './Modal';

const args = {
  children: 'Content',
};

export default {
  title: 'Molecules / UI / Modal',
  component: Modal,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <Modal {...props} />;
