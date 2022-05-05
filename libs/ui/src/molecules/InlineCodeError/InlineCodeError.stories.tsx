import { Result } from '@decipad/language';
import { Meta, Story } from '@storybook/react';
import { InlineCodeError } from './InlineCodeError';

const args = {
  type: {
    kind: 'type-error',
    errorCause: { errType: 'missing-variable', missingVariable: ['foo'] },
  },
  value: null,
} as Result<'type-error'>;

export default {
  title: 'Atoms / Editor / Results / Inline / Error',
  component: InlineCodeError,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <InlineCodeError {...props} />
);
