import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { CodeVariable, CodeVariableProps } from './CodeVariable';

export default {
  title: 'Atoms / Editor / Bubble / Code Variable',
  component: CodeVariable,
  args: {
    children: 'Interest Rate',
  },
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof CodeVariable>> = (
  args: CodeVariableProps
) => <CodeVariable {...args} />;

export const VariableMissing: StoryFn<ComponentProps<typeof CodeVariable>> = (
  args: CodeVariableProps
) => <CodeVariable {...args} variableMissing />;

export const NotInitialized: StoryFn<ComponentProps<typeof CodeVariable>> = (
  args: CodeVariableProps
) => <CodeVariable {...args} isInitialized={false} />;
