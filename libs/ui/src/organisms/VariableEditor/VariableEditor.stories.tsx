import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { VariableEditor } from './VariableEditor';
import { Caption, Expression } from '../../molecules';
import { Slider } from '../../atoms';

export default {
  title: 'Organisms / Editor / Variable Editor',
  component: VariableEditor,
} as Meta;

export const Normal: Story<ComponentProps<typeof VariableEditor>> = () => {
  return (
    <VariableEditor>
      <Caption>Variable</Caption>
      <Expression>10</Expression>
    </VariableEditor>
  );
};

export const SliderVariant: Story<
  ComponentProps<typeof VariableEditor>
> = () => {
  return (
    <VariableEditor variant="slider">
      <Caption>Variable</Caption>
      <Expression>5 km^2</Expression>
      <Slider value="5" max="10" min="0" step="1" />
    </VariableEditor>
  );
};
