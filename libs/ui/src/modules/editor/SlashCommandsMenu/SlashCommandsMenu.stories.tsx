import { Meta, StoryFn } from '@storybook/react';
import { SlashCommandsMenu, SlashCommandsMenuProps } from './SlashCommandsMenu';

const args = {
  search: '',
};

export default {
  title: 'Organisms / Editor / Slash Commands / Menu',
  component: SlashCommandsMenu,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: SlashCommandsMenuProps) => (
  <SlashCommandsMenu {...props} />
);
