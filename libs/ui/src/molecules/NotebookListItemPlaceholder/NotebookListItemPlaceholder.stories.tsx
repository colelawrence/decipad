import { Meta, Story } from '@storybook/react';
import { NotebookListItemPlaceholder } from './NotebookListItemPlaceholder';

export default {
  title: 'Molecules / UI / Notebook List / Item Placeholder',
  component: NotebookListItemPlaceholder,
} as Meta;

export const Normal: Story = () => <NotebookListItemPlaceholder />;
