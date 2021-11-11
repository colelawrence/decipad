import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import { EditableTableCaption } from './EditableTableCaption';

export default {
  title: 'Molecules / Table / Editable Caption',
  component: EditableTableCaption,
  args: {
    value: 'Table Name',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof EditableTableCaption>> = (
  args
) => (
  <table style={{ width: '100%' }}>
    <EditableTableCaption {...args} />
  </table>
);
