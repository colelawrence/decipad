import { Meta, Story } from '@storybook/react';
import { AST, Type } from '@decipad/language';

import { InlineCodeResult } from './InlineCodeResult';

const args = {
  statement: {
    type: 'column',
  } as AST.Statement,
  type: {
    cellType: {
      type: 'string',
    },
    columnSize: 5,
  } as Type,
  value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
};

export default {
  title: 'Organisms / Editor / Result / Inline',
  component: InlineCodeResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <InlineCodeResult {...props} />
);
