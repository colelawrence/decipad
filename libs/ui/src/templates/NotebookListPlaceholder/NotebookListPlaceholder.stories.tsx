import { Meta, Story } from '@storybook/react';
import { NotebookListPlaceholder } from './NotebookListPlaceholder';

export default {
  title: 'Templates / Dashboard / Notebook List / Placeholder',
  component: NotebookListPlaceholder,
} as Meta;

export const Normal: Story = () => <NotebookListPlaceholder />;
