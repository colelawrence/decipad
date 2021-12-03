import { Meta, Story } from '@storybook/react';
import { ListItem } from '../../atoms';
import { UnorderedList } from './UnorderedList';

const args = {
  numberOfItems: 3,
};

export default {
  title: 'Molecules / List / Unordered',
  component: UnorderedList,
  args,
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfItems }) => (
  <UnorderedList>
    {Array.from({ length: numberOfItems }, (_, i) => (
      <ListItem key={i}>Item {i + 1}</ListItem>
    ))}
  </UnorderedList>
);
