import { Meta, StoryFn } from '@storybook/react';
import { Warning } from '../../../icons';
import { FilterBubbles, FilterBubblesProps } from './FilterBubbles';

const args = {
  icon: <Warning />,
  description: 'Warning',
};

export default {
  title: 'Molecules / UI / Dashboard / Filter Bubbles',
  component: FilterBubbles,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props: FilterBubblesProps) => (
  <FilterBubbles {...props} />
);
