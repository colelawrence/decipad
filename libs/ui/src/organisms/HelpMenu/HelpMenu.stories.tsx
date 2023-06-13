import { Meta, StoryFn } from '@storybook/react';
import { HelpMenu } from './HelpMenu';

export default {
  title: 'Organisms / Help Menu',
  component: HelpMenu,
} as Meta;

export const Normal: StoryFn = () => <HelpMenu />;
