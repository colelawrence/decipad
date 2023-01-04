import { Meta, Story } from '@storybook/react';
import { Warning } from '../../icons';
import { FilterBubbles } from './FilterBubbles';

const args = {
  icon: <Warning />,
  description: 'Warning',
};

export default {
  title: 'Molecules / UI / Dashboard / Filter Bubbles',
  component: FilterBubbles,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <FilterBubbles {...props} />
);
