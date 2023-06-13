import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { ModalForm } from './ModalForm';

const args = {
  onSubmit: noop,
  title: 'Animals',
  label: 'Cat',
  placeholderLabel: 'Animal',
};

export default {
  title: 'Molecules / UI / Modal Form',
  component: ModalForm,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <ModalForm {...props} />;
