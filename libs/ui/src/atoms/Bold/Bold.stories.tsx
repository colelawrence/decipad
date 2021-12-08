import { Meta, Story } from '@storybook/react';
import { Bold } from './Bold';

export default {
  title: 'Atoms / Editor / Text / Inline / Bold',
  component: Bold,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => <Bold {...args} />;
