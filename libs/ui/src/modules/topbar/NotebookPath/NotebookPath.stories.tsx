import { Meta, StoryFn } from '@storybook/react';
import { NotebookPath } from './NotebookPath';

const args = {
  workspace: {
    id: 'wsid',
    name: "John's Workspace",
  },
  notebookName: 'Use of funds',
  isWriter: true,
};
export default {
  title: 'Molecules / UI / Notebook Top Bar / Path',
  component: NotebookPath,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookPath {...props} />
);
