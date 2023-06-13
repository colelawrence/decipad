import { Meta, StoryFn } from '@storybook/react';
import { EditorPlaceholder } from './EditorPlaceholder';

export default {
  title: 'Templates / Notebook / Placeholder',
  component: EditorPlaceholder,
} as Meta;

export const Normal: StoryFn = () => <EditorPlaceholder />;
