import { Meta, StoryFn } from '@storybook/react';
import { EditorTitle } from './EditorTitle';

export default {
  title: 'Molecules / Editor / Title',
  component: EditorTitle,
} as Meta;

export const Normal: StoryFn = () => (
  <EditorTitle Heading="h1">Text</EditorTitle>
);
