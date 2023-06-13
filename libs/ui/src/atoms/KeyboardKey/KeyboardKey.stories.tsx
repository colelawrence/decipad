import { Meta, StoryFn } from '@storybook/react';
import { KeyboardKey } from './KeyboardKey';

const args = {
  children: 'ESC',
};

export default {
  title: 'Atoms / Editor / KeyboardKey',
  component: KeyboardKey,
  args,
  decorators: [
    (Key) => (
      <div>
        Press <Key /> for 👋.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<typeof args> = () => (
  <KeyboardKey>ESC</KeyboardKey>
);
