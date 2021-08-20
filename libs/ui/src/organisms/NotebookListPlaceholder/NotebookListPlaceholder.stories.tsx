import { Meta, Story } from '@storybook/react';
import { NotebookListPlaceholder } from './NotebookListPlaceholder';

export default {
  title: 'Organisms / Notebook List / Placeholder',
  component: NotebookListPlaceholder,
} as Meta;

export const Normal: Story = () => <NotebookListPlaceholder />;
