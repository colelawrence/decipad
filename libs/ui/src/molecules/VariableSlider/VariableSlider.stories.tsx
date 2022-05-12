import { Meta, Story } from '@storybook/react';
import { VariableSlider } from './VariableSlider';

const args = {
  max: 10,
  min: 0,
  value: 5,
  step: 0.1,
};

export default {
  title: 'Molecules / Editor / Variable Slider',
  component: VariableSlider,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <VariableSlider {...props} />
);
