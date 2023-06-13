import { Meta, StoryFn } from '@storybook/react';
import { InlineMenuItem } from '../../atoms';
import { circleIcon, inMenu } from '../../storybook-utils';
import { InlineMenuGroup } from './InlineMenuGroup';

const args = {
  title: 'Title',
  numberOfItems: 2,
};

export default {
  title: 'Organisms / Editor / Slash Commands / Group',
  component: InlineMenuGroup,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: StoryFn<typeof args> = ({ numberOfItems, ...props }) => (
  <InlineMenuGroup {...props}>
    {Array(numberOfItems)
      .fill(null)
      .map((_, i) => (
        <InlineMenuItem
          key={i}
          title={`Item ${i + 1}`}
          description={`Description ${i + 1} goes here`}
          icon={circleIcon}
          enabled
        />
      ))}
  </InlineMenuGroup>
);
