import { Meta, Story } from '@storybook/react';
import { InteractiveInputMenu } from './InteractiveInputMenu';

export default {
  title: 'Organisms / Editor / Input / Menu',
  component: InteractiveInputMenu,
} as Meta;

export const Normal: Story = () => (
  <InteractiveInputMenu trigger={<button>anchor</button>} />
);
