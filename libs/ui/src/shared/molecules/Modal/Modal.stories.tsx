import { Meta, StoryFn } from '@storybook/react';
import { Modal, ModalContentProps } from './Modal';

const args = {
  children: 'Content',
};

export default {
  title: 'Molecules / UI / Modal',
  component: Modal,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: ModalContentProps) => (
  <Modal {...props} />
);

export const NormalWithTitle: StoryFn<typeof args> = (
  props: ModalContentProps
) => <Modal title="Modal Title" {...props} />;
