import { Meta, Story } from '@storybook/react';
import { NotebookListHeader } from './NotebookListHeader';

export default {
  title: 'Molecules / Notebook List Header',
  component: NotebookListHeader,
  argTypes: {
    numberOfNotebooks: {
      type: 'number',
    },
  },
} as Meta;

export const Normal: Story<{ numberOfNotebooks?: number }> = (args) => (
  <NotebookListHeader Heading="h1" {...args} />
);
