import { Meta, StoryFn } from '@storybook/react';
import { HelpButton } from './HelpButton';

export default {
  title: 'Molecules / Help Button',
  component: HelpButton,
} as Meta;

export const Normal: StoryFn = () => <HelpButton />;
