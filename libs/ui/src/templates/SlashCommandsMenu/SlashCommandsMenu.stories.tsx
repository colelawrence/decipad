import { Meta, Story } from '@storybook/react';
import { SlashCommandsMenu } from './SlashCommandsMenu';

const args = {
  search: '',
};

export default {
  title: 'Organisms / Editor / Slash Commands / Menu',
  component: SlashCommandsMenu,
  args,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <SlashCommandsMenu {...props} />
);
