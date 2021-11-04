import { Meta, Story } from '@storybook/react';
import { IconButton } from './IconButton';
import { circleIcon } from '../../storybook-utils';

export default {
  title: 'Atoms / Icon Button',
  component: IconButton,
} as Meta;

export const RoundedSquare: Story = () => <IconButton>{circleIcon}</IconButton>;
