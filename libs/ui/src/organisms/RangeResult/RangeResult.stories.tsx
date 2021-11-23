import { Meta, Story } from '@storybook/react';
import { Type } from '@decipad/language';

import { RangeResult } from './RangeResult';

const type = { rangeOf: { type: 'number' } } as Type;
const args = {
  value: [1, 10],
};

export default {
  title: 'Organisms / Editor / Result / Range',
  component: RangeResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <RangeResult {...props} type={type} />
);
