import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
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
};

it('renders', () => {
  const { container } = render(<NotebookState {...args} />);
  expect(container).toBeInTheDocument();
});
