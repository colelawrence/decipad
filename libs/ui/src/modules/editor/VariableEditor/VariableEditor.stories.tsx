import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { Slider } from '../Slider/Slider';
import { Caption } from '../Caption/Caption';
import { Expression } from '../Expression/Expression';
import { VariableEditor } from './VariableEditor';

export default {
  title: 'Organisms / Editor / Variable Editor',
  component: VariableEditor,
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof VariableEditor>> = () => {
  return (
    <VariableEditor
      variant="expression"
      onClickEdit={() => console.info('clicked')}
    >
      <Caption>Variable</Caption>
      <Expression>10</Expression>
    </VariableEditor>
  );
};

export const SliderVariant: StoryFn<
  ComponentProps<typeof VariableEditor>
> = () => {
  return (
    <VariableEditor variant="slider">
      <Caption>Variable</Caption>
      <Expression>5 km^2</Expression>
      <Slider value={5} max={10} min={0} step={1} />
    </VariableEditor>
  );
};

export const Anything: StoryFn<ComponentProps<typeof VariableEditor>> = () => {
  return (
    <VariableEditor variant="slider" type={{ kind: 'anything' }}>
      <Caption>Variable</Caption>
      <Expression>5 km^2</Expression>
      <Slider value={5} max={10} min={0} step={1} />
    </VariableEditor>
  );
};
