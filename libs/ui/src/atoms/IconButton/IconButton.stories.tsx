import { Meta, Story } from '@storybook/react';
import { IconButton } from './IconButton';
import { cssVar } from '../../primitives';

export default {
  title: 'Atoms / Icon Button',
  component: IconButton,
} as Meta;

export const RoundedSquare: Story = () => (
  <IconButton>
    <svg>
      <circle cx="50%" cy="50%" r="50%" fill={cssVar('currentTextColor')} />
    </svg>
  </IconButton>
);
