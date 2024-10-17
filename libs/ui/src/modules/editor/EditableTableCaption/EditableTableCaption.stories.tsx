import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import {
  EditableTableCaption,
  EditableTableCaptionProps,
} from './EditableTableCaption';

export default {
  title: 'Molecules / Editor / Table / Editable Caption',
  component: EditableTableCaption,
  args: {
    value: 'Table Name',
  },
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof EditableTableCaption>> = (
  args: EditableTableCaptionProps
) => (
  <table style={{ width: '100%' }}>
    <EditableTableCaption {...args} />
  </table>
);
