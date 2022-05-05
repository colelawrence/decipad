import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { circleIcon } from '../../storybook-utils';
import { IconButton } from './IconButton';

export default {
  title: 'Atoms / UI / Icon Button',
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
