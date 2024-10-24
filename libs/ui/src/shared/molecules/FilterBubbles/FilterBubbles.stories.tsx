import { Meta, StoryFn } from '@storybook/react';
import { Warning } from '../../../icons';
import { FilterBubbles, FilterBubblesProps } from './FilterBubbles';

const _args = {
  icon: <Warning />,
  description: 'Warning',
};

export default {
  title: 'Molecules / UI / Dashboard / Filter Bubbles',
  component: FilterBubbles,
} as Meta<typeof _args>;

export const Normal: StoryFn<typeof _args> = (props: FilterBubblesProps) => (
  <FilterBubbles {...props} />
);
