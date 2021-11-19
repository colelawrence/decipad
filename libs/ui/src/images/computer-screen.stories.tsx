import { Meta, Story } from '@storybook/react';
import computerScreen from './computer-screen.png';

export default {
  title: 'Images',
} as Meta;

export const ComputerScreen: Story = () => (
  <img alt="Computer screen" src={computerScreen} />
);
