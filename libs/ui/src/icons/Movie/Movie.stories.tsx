import { Meta, Story } from '@storybook/react';
import { Movie } from './Movie';

export default {
  title: 'Icons / Movie',
  component: Movie,
} as Meta;

export const Normal: Story = () => <Movie />;
