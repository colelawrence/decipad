import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { NotebookListItemActions } from './NotebookListItemActions';

const props: ComponentProps<typeof NotebookListItemActions> = {
  href: '',
};

it('renders a list of 4 actions', () => {
  render(<NotebookListItemActions {...props} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});

it('can duplicate a notebook', async () => {
  const handleDuplicate = jest.fn();
  render(<NotebookListItemActions {...props} onDuplicate={handleDuplicate} />);

  await userEvent.click(screen.getByText(/dup/i));
  expect(handleDuplicate).toHaveBeenCalled();
});

it('can delete a notebook', async () => {
  const handleDelete = jest.fn();
  render(<NotebookListItemActions {...props} onDelete={handleDelete} />);

  await userEvent.click(screen.getByText(/del|rem/i, { selector: 'button' }));
  expect(handleDelete).toHaveBeenCalled();
});

it('can export a notebook', async () => {
  const handleExport = jest.fn();
  render(<NotebookListItemActions {...props} onExport={handleExport} />);

  await userEvent.click(screen.getByText(/export/i));
  expect(handleExport).toHaveBeenCalled();
});
