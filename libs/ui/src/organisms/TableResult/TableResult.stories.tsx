import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { withCode } from '../../storybook-utils';
import { TableResult } from './TableResult';

export default {
  title: 'Organisms / Editor / Result / Table',
  component: TableResult,
  decorators: [withCode('my_table = { H1 = [1, 2], H2 = ["A", "B"]}')],
} as Meta;

export const Normal: Story<ComponentProps<typeof TableResult>> = (props) => {
  return <TableResult {...props} />;
};
