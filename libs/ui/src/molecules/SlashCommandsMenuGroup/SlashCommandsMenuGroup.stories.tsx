import { Meta, Story } from '@storybook/react';
import { SlashCommandsMenuItem } from '../../atoms';
import { circleIcon, inMenu } from '../../storybook-utils';
import { SlashCommandsMenuGroup } from './SlashCommandsMenuGroup';

const args = {
  title: 'Title',
  numberOfItems: 2,
};

export default {
  title: 'Organisms / Editor / Slash Commands / Group',
  component: SlashCommandsMenuGroup,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: Story<typeof args> = ({ numberOfItems, ...props }) => (
  <SlashCommandsMenuGroup {...props}>
    {Array(numberOfItems)
      .fill(null)
      .map((_, i) => (
        <SlashCommandsMenuItem
          key={i}
          title={`Item ${i + 1}`}
          description={`Description ${i + 1} goes here`}
          icon={circleIcon}
          enabled
        />
      ))}
  </SlashCommandsMenuGroup>
);
