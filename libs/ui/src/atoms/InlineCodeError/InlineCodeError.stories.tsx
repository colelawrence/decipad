import { Meta, Story } from '@storybook/react';

import { InlineCodeError } from './InlineCodeError';

const args = {
  message: 'This operation requires matching units',
  url: 'https://dev.decipad.com/docs/docs/language/composing-units',
};

export default {
  title: 'Atoms / Editor / Result / Error',
  component: InlineCodeError,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <InlineCodeError {...props} />
);
