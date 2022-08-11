import { Meta, Story } from '@storybook/react';
import { ErrorBlock, ErrorBlockProps } from './ErrorBlock';

export default {
  title: 'Organisms / UI / ErrorBlock',
  component: ErrorBlock,
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['error', 'warning', 'complete-error'],
      defaultValue: 'error',
    },
  },
} as Meta<ErrorBlockProps>;

export const Normal: Story<ErrorBlockProps> = (args) => (
  <ErrorBlock {...args} />
);
