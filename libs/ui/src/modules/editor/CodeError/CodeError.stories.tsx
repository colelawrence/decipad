import { Meta, StoryFn } from '@storybook/react';
import { CodeError, CodeErrorProps } from './CodeError';

const args = {
  message: 'This operation requires compatible units',
  url: 'https://decipad.com/docs/errors#expected-unit',
};

export default {
  title: 'Atoms / Editor / Results / Error',
  component: CodeError,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: CodeErrorProps) => (
  <CodeError {...props} />
);
export const Smol: StoryFn<typeof args> = (props: CodeErrorProps) => (
  <CodeError {...props} variant="smol" />
);
