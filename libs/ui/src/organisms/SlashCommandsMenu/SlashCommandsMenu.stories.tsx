import { Meta, Story } from '@storybook/react';
import { SlashCommandsMenu } from './SlashCommandsMenu';

export default {
  title: 'Editor / Slash Commands Menu',
  component: SlashCommandsMenu,
} as Meta;

export const Normal: Story = () => <SlashCommandsMenu />;
