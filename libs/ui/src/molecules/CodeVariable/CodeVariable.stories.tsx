import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { CodeVariable } from './CodeVariable';

export default {
  title: 'Atoms / Editor / Bubble / Code Variable',
  component: CodeVariable,
  args: {
    children: 'Interest Rate',
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof CodeVariable>> = (args) => (
  <CodeVariable {...args} />
);

export const VariableMissing: Story<ComponentProps<typeof CodeVariable>> = (
  args
) => <CodeVariable {...args} variableScope="undefined" />;
