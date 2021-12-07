import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { CodeLine } from './CodeLine';

export default {
  title: 'Atoms / Editor / Code / Line',
  component: CodeLine,
  args: {
    children: '10 + 10',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof CodeLine>> = (args) => (
  <CodeLine {...args} />
);
