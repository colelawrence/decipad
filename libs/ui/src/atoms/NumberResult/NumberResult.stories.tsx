import { Meta, Story } from '@storybook/react';
import { Type } from '@decipad/language';

import { NumberResult } from './NumberResult';

const type = { type: 'number' } as Type;
const unitType = {
  type: 'number',
  unit: { type: 'units' },
  toString() {
    return `bananas`;
  },
} as Type;

const args = {
  value: 10,
};

export default {
  title: 'Atoms / Editor / Result / Number',
  component: NumberResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <NumberResult {...props} type={type} />
);

export const Formatted: Story<typeof args> = (props) => (
  <NumberResult {...props} type={type} />
);
Formatted.args = {
  value: 10000,
};

export const Decimal: Story<typeof args> = (props) => (
  <NumberResult {...props} type={type} />
);
Decimal.args = {
  value: 0.1,
};

export const Unit: Story<typeof args> = (props) => (
  <NumberResult {...props} type={unitType} />
);
