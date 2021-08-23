import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookListItemActions } from './NotebookListItemActions';

it('renders a list of 3 actions', () => {
  const { getAllByRole } = render(<NotebookListItemActions href="" />);
  expect(getAllByRole('listitem')).toHaveLength(3);
});

it('links to the notebook', () => {
  const { getByRole } = render(<NotebookListItemActions href="/notebook" />);
  expect(getByRole('link')).toHaveAttribute('href', '/notebook');
});

it('can duplicate an notebook', () => {
  const handleDuplicate = jest.fn();
  const { getByText } = render(
    <NotebookListItemActions href="" onDuplicate={handleDuplicate} />
  );

  userEvent.click(getByText(/dup/i));
  expect(handleDuplicate).toHaveBeenCalled();
});

it('can delete an notebook', () => {
  const handleDelete = jest.fn();
  const { getByText } = render(
    <NotebookListItemActions href="" onDelete={handleDelete} />
  );

  userEvent.click(getByText(/del|rem/i, { selector: 'button' }));
  expect(handleDelete).toHaveBeenCalled();
});
