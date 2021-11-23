import { Meta, Story } from '@storybook/react';
import { Type } from '@decipad/language';

import { DateResult } from './DateResult';

const args = {
  value: new Date('2021-01-01').getTime(),
};

export default {
  title: 'Atoms / Editor / Result / Date',
  component: DateResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <DateResult {...props} type={{ date: 'day' } as Type} />
);

export const Month: Story<typeof args> = (props) => (
  <DateResult {...props} type={{ date: 'month' } as Type} />
);

export const Year: Story<typeof args> = (props) => (
  <DateResult {...props} type={{ date: 'year' } as Type} />
);

export const Time: Story<typeof args> = (props) => (
  <DateResult {...props} type={{ date: 'time' } as Type} />
);
