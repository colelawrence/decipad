import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
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

export const Normal: Story<typeof args> = (props) => <ModalForm {...props} />;
