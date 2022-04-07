import { Meta, Story } from '@storybook/react';
import computerScreen from './computer-screen.png';

export default {
  title: 'Images / Computer Screen',
} as Meta;

export const ComputerScreen: Story = () => (
  <img alt="Computer screen" src={computerScreen} />
);
