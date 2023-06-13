import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { Caret } from '../../icons';
import { getNumberType } from '../../utils';
import { TableHeader } from './TableHeader';

const args: ComponentProps<typeof TableHeader> = {
  children: 'Column title',
};

export default {
  title: 'Atoms / Editor / Table / Column Header',
  component: TableHeader,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <TableHeader {...props} />
);

export const AnotherType: StoryFn<typeof args> = (props) => (
  <TableHeader {...props} type={getNumberType()} />
);

export const WithRightSlotIcon: StoryFn<typeof args> = (props) => (
  <TableHeader
    {...props}
    menu={
      <div style={{ width: '16px', height: '16px' }}>
        <Caret variant="down" />
      </div>
    }
  />
);

export const Highlighted: StoryFn<typeof args> = (props) => (
  <TableHeader {...props} highlight />
);
