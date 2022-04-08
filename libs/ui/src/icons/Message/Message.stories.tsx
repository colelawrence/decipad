import { Meta, Story } from '@storybook/react';
import { Message } from './Message';

export default {
  title: 'Icons / Message',
  component: Message,
} as Meta;

export const Normal: Story = () => <Message />;
