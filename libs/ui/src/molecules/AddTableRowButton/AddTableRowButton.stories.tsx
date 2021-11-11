import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';

import { AddTableRowButton } from './AddTableRowButton';

export default {
  title: 'Molecules / Table / Add Row Button',
  component: AddTableRowButton,
  args: {
    colSpan: 1,
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof AddTableRowButton>> = (
  args
) => <AddTableRowButton {...args} />;
