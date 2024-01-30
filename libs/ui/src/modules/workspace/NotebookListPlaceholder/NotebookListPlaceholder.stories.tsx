import { Meta, StoryFn } from '@storybook/react';
import { NotebookListPlaceholder } from './NotebookListPlaceholder';

export default {
  title: 'Templates / Dashboard / Notebook List / Item Placeholder',
  component: NotebookListPlaceholder,
} as Meta;

export const Normal: StoryFn = () => <NotebookListPlaceholder />;
