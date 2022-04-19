import { Meta, Story } from '@storybook/react';
import { EditorTitle } from './EditorTitle';

export default {
  title: 'Molecules / Editor / Title',
  component: EditorTitle,
} as Meta;

export const Normal: Story = () => <EditorTitle Heading="h1">Text</EditorTitle>;
