import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import { EditableTableData } from './EditableTableData';

export default {
  title: 'Molecules / Table / Editable Data',
  component: EditableTableData,
  args: {
    value: 'Table Cell',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof EditableTableData>> = (
  args
) => (
  <table style={{ width: '100%' }}>
    <EditableTableData {...args} />
  </table>
);
