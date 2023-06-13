import { Meta, StoryFn } from '@storybook/react';
import { Toggle } from './Toggle';

const args = {
  active: false,
};

export default {
  title: 'Atoms / UI / Toggle',
  component: Toggle,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => <Toggle {...props} />;
