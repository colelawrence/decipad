import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { VariableEditor } from './VariableEditor';

export default {
  title: 'Organisms / Editor / Input / Expression Editor',
  component: VariableEditor,
} as Meta;

export const Normal: Story<ComponentProps<typeof VariableEditor>> = () => {
  return <VariableEditor />;
};
