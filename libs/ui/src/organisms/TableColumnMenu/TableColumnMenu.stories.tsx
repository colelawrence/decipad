import { Meta, Story } from '@storybook/react';
import { TableColumnMenu } from './TableColumnMenu';

export default {
  title: 'Organisms / Table / Column Menu',
  component: TableColumnMenu,
} as Meta;

export const Normal: Story = () => (
  <TableColumnMenu open trigger={<button>anchor</button>} type="number" />
);
