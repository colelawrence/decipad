import { Meta, Story } from '@storybook/react';
import { noop } from '@decipad/utils';
import { IconButton } from './IconButton';
import { circleIcon } from '../../storybook-utils';

export default {
  title: 'Atoms / Icon Button',
  component: IconButton,
} as Meta;

export const Round: Story = () => (
  <IconButton onClick={noop}>{circleIcon}</IconButton>
);

export const RoundedSquare: Story = () => (
  <IconButton roundedSquare onClick={noop}>
    {circleIcon}
  </IconButton>
);

export const AsLink: Story = () => (
  <IconButton href="">{circleIcon}</IconButton>
);
