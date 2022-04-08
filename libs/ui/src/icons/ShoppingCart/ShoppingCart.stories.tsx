import { Meta, Story } from '@storybook/react';
import { ShoppingCart } from './ShoppingCart';

export default {
  title: 'Icons / Shopping Cart',
  component: ShoppingCart,
} as Meta;

export const Normal: Story = () => <ShoppingCart />;
