import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Toast } from './Toast';

const args: ComponentProps<typeof Toast> = {
  appearance: 'info',
  children: 'Toastie toast',
};

export default {
  title: 'Atoms / Toast',
  component: Toast,
  args,
  argTypes: {
    appearance: {
      options: ['info', 'success', 'error', 'warning'],
      control: { type: 'radio' },
    },
  },
} as Meta<ComponentProps<typeof Toast>>;

export const Normal: Story<ComponentProps<typeof Toast>> = (props) => (
  <Toast {...props} />
);
