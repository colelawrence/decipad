import { Meta, StoryFn } from '@storybook/react';
import { ListItemContent } from '../../atoms';
import { OrderedList } from './OrderedList';

const args = {
  numberOfItems: 10,
};

export default {
  title: 'Molecules / Editor / List / Ordered',
  component: OrderedList,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = ({ numberOfItems }) => (
  <OrderedList>
    {Array(numberOfItems)
      .fill(null)
      .map((_, i) => (
        <ListItemContent key={i}>Item {i + 1}</ListItemContent>
      ))}
  </OrderedList>
);
