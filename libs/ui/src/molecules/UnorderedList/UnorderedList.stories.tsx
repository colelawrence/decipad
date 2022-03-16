import { Meta, Story } from '@storybook/react';
import { ListItemContent } from '../../atoms';
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
      <ListItemContent key={i}>Item {i + 1}</ListItemContent>
    ))}
  </UnorderedList>
);

const nestedArgs = { numberOfItems: 2, levels: 2 };
export const Nested: Story<typeof nestedArgs> = (
  { numberOfItems, levels },
  context
) => (
  <UnorderedList>
    {Array.from({ length: numberOfItems }, (_, i) => (
      <ListItemContent key={i}>
        Item {i + 1}
        {levels > 1 && Nested({ numberOfItems, levels: levels - 1 }, context)}
      </ListItemContent>
    ))}
  </UnorderedList>
);
Nested.args = nestedArgs;
