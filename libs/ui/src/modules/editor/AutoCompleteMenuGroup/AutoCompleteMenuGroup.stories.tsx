import { Meta, StoryFn } from '@storybook/react';
import { AutoCompleteMenuItem } from '../AutoCompleteMenuItem/AutoCompleteMenuItem';
import { inMenu } from '../../../storybook-utils';
import { AutoCompleteMenuGroup } from './AutoCompleteMenuGroup';

const args = {
  title: 'Title',
  numberOfItems: 2,
};

export default {
  title: 'Molecules / Editor / Auto Complete Menu / Group',
  component: AutoCompleteMenuGroup,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: StoryFn<typeof args> = ({ numberOfItems, ...props }) => (
  <AutoCompleteMenuGroup {...props}>
    {Array(numberOfItems)
      .fill(null)
      .map((_, i) => (
        <AutoCompleteMenuItem
          key={i}
          item={{
            autocompleteGroup: 'variable',
            kind: 'number',
            name: `MyVariable${i}`,
          }}
        />
      ))}
  </AutoCompleteMenuGroup>
);
