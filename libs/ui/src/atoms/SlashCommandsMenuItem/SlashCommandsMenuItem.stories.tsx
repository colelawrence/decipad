import { Meta, Story } from '@storybook/react';
import { circleIcon, inMenu } from '../../storybook-utils';
import { SlashCommandsMenuItem } from './SlashCommandsMenuItem';

const args = {
  title: 'Title',
  description: 'Description goes here',
};

export default {
  title: 'Organisms / Editor / Slash Commands Menu / Item',
  component: SlashCommandsMenuItem,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <SlashCommandsMenuItem {...props} icon={circleIcon} />
);
