import { Meta, Story } from '@storybook/react';
import { CodeError } from './CodeError';

const args = {
  message: 'This operation requires compatible units',
  url: 'https://decipad.com/docs/errors#expected-unit',
};

export default {
  title: 'Atoms / Editor / Results / Error',
  component: CodeError,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <CodeError {...props} />;
export const Smol: Story<typeof args> = (props) => (
  <CodeError {...props} variant="smol" />
);
