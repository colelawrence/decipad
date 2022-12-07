import { Meta, Story } from '@storybook/react';
import { ThemePicker } from './ThemePicker';

const args = {
  active: false,
};

export default {
  title: 'Atoms / UI / Theme Picker',
  component: ThemePicker,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <ThemePicker {...props} />;
