import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { CodeVariable } from './CodeVariable';

export default {
  title: 'Atoms / Editor / Code / Variable',
  component: CodeVariable,
  args: {
    children: 'Variable',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof CodeVariable>> = (args) => (
  <CodeVariable {...args} />
);

export const VariableMissing: Story<ComponentProps<typeof CodeVariable>> = (
  args
) => <CodeVariable {...args} variableMissing />;
