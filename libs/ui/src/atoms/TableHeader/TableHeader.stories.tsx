import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { TableHeader } from './TableHeader';
import { getNumberType } from '../../utils';

export default {
  title: 'Atoms / Table / Header',
  component: TableHeader,
  args: {
    children: 'Column title',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof TableHeader>> = (args) => (
  <TableHeader {...args} />
);

export const AnotherType: Story<ComponentProps<typeof TableHeader>> = (
  args
) => <TableHeader type={getNumberType()} {...args} />;

export const Highlighted: Story<ComponentProps<typeof TableHeader>> = (
  args
) => <TableHeader highlight {...args} />;
