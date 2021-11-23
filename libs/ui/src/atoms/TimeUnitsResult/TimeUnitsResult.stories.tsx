import { Type } from '@decipad/language';
import { Meta, Story } from '@storybook/react';

import { TimeUnitsResult } from './TimeUnitsResult';

const type = {
  timeUnits: ['year', 'quarter', 'month', 'week', 'day'],
} as Type;

const args = {
  value: [
    ['month', 1],
    ['day', 10],
  ],
};

export default {
  title: 'Atoms / Editor / Result / Time Units',
  component: TimeUnitsResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <TimeUnitsResult {...props} type={type} />
);
