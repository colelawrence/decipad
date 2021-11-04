import { Meta, Story } from '@storybook/react';
import { circleIcon, inMenu, padding } from '../../storybook-utils';
import { SlashCommandsMenuItem } from './SlashCommandsMenuItem';

const args = {
  title: 'Title',
  description: 'Description goes here',
};

export default {
  title: 'Editor / Slash Commands Menu / Item',
  component: SlashCommandsMenuItem,
  args,
  decorators: [padding(8), inMenu],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <SlashCommandsMenuItem {...props} icon={circleIcon} />
);
