import { Meta, StoryFn } from '@storybook/react';
import { Overlay } from './Overlay';

export default {
  title: 'Atoms / UI / Overlay',
  component: Overlay,
} as Meta;

export const Normal: StoryFn = () => <Overlay />;
