import { Result } from '@decipad/language';
import { Meta, StoryFn } from '@storybook/react';
import { InlineCodeError } from './InlineCodeError';

const args = {
  type: {
    kind: 'type-error',
    errorCause: { errType: 'missing-variable', missingVariable: ['foo'] },
  },
  value: null,
} as Result.Result<'type-error'>;

export default {
  title: 'Atoms / Editor / Results / Inline / Error',
  component: InlineCodeError,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <InlineCodeError {...props} />
);
