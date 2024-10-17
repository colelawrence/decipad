import { Meta, StoryFn } from '@storybook/react';
import {
  NotebookListHeader,
  NotebookListHeaderProps,
} from './NotebookListHeader';

export default {
  title: 'Molecules / UI / Notebook List / Header',
  component: NotebookListHeader,
  args: {
    numberOfNotebooks: 2,
  },
} as Meta;

export const Normal: StoryFn<{ numberOfNotebooks?: number }> = (
  args: NotebookListHeaderProps
) => <NotebookListHeader {...args} />;

export const Loading: StoryFn = () => <NotebookListHeader Heading="h1" />;
