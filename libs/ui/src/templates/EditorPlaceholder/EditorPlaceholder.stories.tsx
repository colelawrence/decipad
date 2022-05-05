import { Meta, Story } from '@storybook/react';
import { EditorPlaceholder } from './EditorPlaceholder';

export default {
  title: 'Templates / Notebook / Placeholder',
  component: EditorPlaceholder,
} as Meta;

export const Normal: Story = () => <EditorPlaceholder />;
