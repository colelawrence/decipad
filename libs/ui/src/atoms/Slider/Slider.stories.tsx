import { Meta, Story } from '@storybook/react';
import { Slider } from './Slider';

const args = {
  max: 10,
  min: 0,
  value: 5,
  step: 0.1,
};

export default {
  title: 'Atoms / Editor / Inputs / Slider',
  component: Slider,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Slider {...props} />;
