import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { EditorIcon } from './EditorIcon';

const args: ComponentProps<typeof EditorIcon> = {
  color: 'Sun',
  icon: 'Spider',
};

export default {
  title: 'Organisms / Editor / Icon',
  component: EditorIcon,
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props) => (
  <EditorIcon {...props} />
);
