import { Meta, Story } from '@storybook/react';
import { Expression } from './Expression';

const args = {
  children: <span>children here</span>,
  error: {
    message: 'some error',
    url: 'some url',
  },
  placeholder: 'placeholder',
};

export default {
  title: 'Molecules / Editor / Expression',
  component: Expression,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => <Expression {...props} />;
