import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Caret } from '../../icons';
import { getNumberType } from '../../utils';
import { TableHeader } from './TableHeader';

const args: ComponentProps<typeof TableHeader> = {
  children: 'Column title',
};

export default {
  title: 'Atoms / Table / Header',
  component: TableHeader,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <TableHeader {...props} />;

export const AnotherType: Story<typeof args> = (props) => (
  <TableHeader {...props} type={getNumberType()} />
);

export const WithRightSlotIcon: Story<typeof args> = (props) => (
  <TableHeader
    {...props}
    rightSlot={
      <div style={{ width: '16px', height: '16px' }}>
        <Caret variant="down" />
      </div>
    }
  />
);

export const Highlighted: Story<typeof args> = (props) => (
  <TableHeader {...props} highlight />
);
