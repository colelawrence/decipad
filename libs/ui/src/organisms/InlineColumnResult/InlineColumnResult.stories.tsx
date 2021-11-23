import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { InlineColumnResult } from './InlineColumnResult';

export default {
  title: 'Organisms / Editor / Result / Inline / Column',
  component: InlineColumnResult,
  args: {
    value: [10, 20, 30],
    type: { cellType: { type: 'number' } },
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof InlineColumnResult>> = (
  args
) => <InlineColumnResult {...args} />;
