import { Meta, Story } from '@storybook/react';
import { getNumberType } from '../../utils';
import { TableColumnMenu } from './TableColumnMenu';

export default {
  title: 'Organisms / Editor / Table / Column Menu',
  component: TableColumnMenu,
} as Meta;

export const Normal: Story = () => (
  <TableColumnMenu
    open
    trigger={<button>anchor</button>}
    type={getNumberType()}
  />
);
