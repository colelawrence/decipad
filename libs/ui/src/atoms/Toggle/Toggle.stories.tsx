import { Meta, Story } from '@storybook/react';
import { Toggle } from './Toggle';

const args = {
  active: false,
};

export default {
  title: 'Atoms / UI / Toggle',
  component: Toggle,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Toggle {...props} />;
