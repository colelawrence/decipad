import { Meta, StoryFn } from '@storybook/react';
import { Slider } from './Slider';

const args = {
  max: 10,
  min: 0,
  value: 5,
  step: 0.1,
};

export default {
  title: 'Atoms / Editor / Input / Slider',
  component: Slider,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <Slider {...props} />;
