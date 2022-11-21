import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { NotebookState } from './NotebookState';

const args: ComponentProps<typeof NotebookState> = {
  undo: () => {},
  redo: () => {},
  revertChanges: () => {},
  canUndo: true,
  canRedo: true,
  readOnly: true,
  saved: true,
  isOffline: false,
  authed: true,
};

export default {
  title: 'Molecules / UI / Notebook / State',
  component: NotebookState,
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <NotebookState {...props} />
);
