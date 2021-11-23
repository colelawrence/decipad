import { Type } from '@decipad/language';
import { Meta, Story } from '@storybook/react';

import { CodeResult } from './CodeResult';

const args = {
  type: {
    cellType: {
      type: 'string',
    },
    columnSize: 5,
  } as Type,
  value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
};

export default {
  title: 'Organisms / Editor / Result',
  component: CodeResult,
  args,
} as Meta;

export const Inline: Story<typeof args> = (props) => (
  <CodeResult {...props} variant="inline" />
);

export const Block: Story<typeof args> = (props) => (
  <CodeResult {...props} variant="block" />
);
