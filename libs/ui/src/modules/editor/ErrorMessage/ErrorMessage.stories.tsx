import { Meta, StoryFn } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const args = {
  error: 'This operation requires compatible units',
};

export default {
  title: 'Atoms / Editor / Charts / Error Message',
  component: ErrorMessage,
  args,
} as Meta;

export const Normal: StoryFn = () => <ErrorMessage {...args} />;
