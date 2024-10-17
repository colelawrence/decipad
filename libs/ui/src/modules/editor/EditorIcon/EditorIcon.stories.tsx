import { Meta, StoryFn } from '@storybook/react';
import { EditorIcon, EditorIconProps } from './EditorIcon';

const args: EditorIconProps = {
  color: 'Sun',
  icon: 'Spider',
};

export default {
  title: 'Organisms / Editor / Icon',
  component: EditorIcon,
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props: EditorIconProps) => (
  <EditorIcon {...props} />
);
