import { Meta, Story } from '@storybook/react';
import { TableHeaderRow } from '../../molecules';
import { EditableTableHeader } from './EditableTableHeader';

export default {
  title: 'Organisms / Table / Editable Header',
  component: TableHeaderRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <EditableTableHeader type="string" value="Header1" />
  </table>
);
