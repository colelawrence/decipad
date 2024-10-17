import { Meta, StoryContext, StoryFn } from '@storybook/react';
import { ListItemContent } from '../../../shared';
import { UnorderedList } from './UnorderedList';

const args = {
  numberOfItems: 3,
};

interface NestedArgsProps {
  numberOfItems: number;
  levels: number;
}

export default {
  title: 'Molecules / Editor / List / Unordered',
  component: UnorderedList,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = ({
  numberOfItems,
}: NestedArgsProps) => (
  <UnorderedList>
    {Array.from({ length: numberOfItems }, (_, i) => (
      <ListItemContent key={i}>Item {i + 1}</ListItemContent>
    ))}
  </UnorderedList>
);

const nestedArgs = { numberOfItems: 2, levels: 2 };
export const Nested: StoryFn<typeof nestedArgs> = (
  { numberOfItems, levels }: NestedArgsProps,
  context: StoryContext
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
