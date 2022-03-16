import { Meta, Story } from '@storybook/react';
import { ListItemContent } from '../../atoms';
import { OrderedList } from './OrderedList';

const args = {
  numberOfItems: 10,
};

export default {
  title: 'Molecules / List / Ordered',
  component: OrderedList,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfItems }) => (
  <OrderedList>
    {Array(numberOfItems)
      .fill(null)
      .map((_, i) => (
        <ListItemContent key={i}>Item {i + 1}</ListItemContent>
      ))}
  </OrderedList>
);
