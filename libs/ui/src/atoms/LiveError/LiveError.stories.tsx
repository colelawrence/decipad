import { Meta, StoryFn } from '@storybook/react';
import { LiveError } from './LiveError';

const args = {
  error: {
    name: 'Test',
    message: 'This operation requires compatible units',
    url: 'https://decipad.com/docs/errors#expected-unit',
  },
  errorURL: '/docs/',
};

export default {
  title: 'Atoms / Editor / Live / Error',
  component: LiveError,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <LiveError {...props} />;
export const ConnectionError: StoryFn<typeof args> = () => (
  <LiveError error={new Error('Failed to fetch the thing')} />
);
