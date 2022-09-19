import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { TableResult } from './TableResult';

export default {
  title: 'Organisms / Editor / Results / Table',
  component: TableResult,
  decorators: [
    withCode(
      'my_table = { VeryLongHeading1 = [1, 2], VeryLongHeading2 = ["A", "B"], VeryLongHeading3 = ["C", "D"]}'
    ),
  ],
} as Meta;

export const Normal: Story<ComponentProps<typeof TableResult>> = (props) => {
  return <TableResult {...props} />;
};
