import { Meta, Story } from '@storybook/react';
import { TableColumnMenu } from './TableColumnMenu';

export default {
  title: 'Organisms / Table / Column Menu',
  component: TableColumnMenu,
} as Meta;

export const Normal: Story = () => (
  <TableColumnMenu trigger={<button>click me</button>} type="number" />
);
