import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { Add } from '../../../icons';
import { circleIcon } from '../../../storybook-utils';
import { IconButton } from './IconButton';

export default {
  title: 'Atoms / UI / Icon Button',
  component: IconButton,
} as Meta;

export const Default: StoryFn = () => (
  <IconButton href="">
    <Add />
  </IconButton>
);

export const Round: StoryFn = () => (
  <IconButton onClick={noop}>{circleIcon}</IconButton>
);

export const RoundedSquare: StoryFn = () => (
  <IconButton roundedSquare onClick={noop}>
    {circleIcon}
  </IconButton>
);

export const AsLink: StoryFn = () => (
  <IconButton href="">{circleIcon}</IconButton>
);
