import { Meta, Story } from '@storybook/react';
import { NotebookListItemActions } from './NotebookListItemActions';

export default {
  title: 'Molecules / UI / Notebook List / Item Actions',
  component: NotebookListItemActions,
} as Meta;

export const Normal: Story = () => <NotebookListItemActions href="" />;
