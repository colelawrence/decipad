import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { ExpressionEditor } from './ExpressionEditor';

export default {
  title: 'Organisms / Editor / Expression Editor',
  component: ExpressionEditor,
} as Meta;

export const Normal: Story<ComponentProps<typeof ExpressionEditor>> = () => {
  return <ExpressionEditor />;
};
