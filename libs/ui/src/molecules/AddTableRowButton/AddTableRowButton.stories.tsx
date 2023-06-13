import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { AddTableRowButton } from './AddTableRowButton';

export default {
  title: 'Molecules / Editor / Table / Add Row Button',
  component: AddTableRowButton,
  args: {
    colSpan: 1,
  },
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof AddTableRowButton>> = (
  args
) => <AddTableRowButton {...args} />;
