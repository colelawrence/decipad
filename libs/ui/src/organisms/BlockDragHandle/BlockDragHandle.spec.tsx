import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockDragHandle } from './BlockDragHandle';

it('shows a tooltip when focussing the handle', async () => {
  const { queryByText, findByText, getByTitle } = render(<BlockDragHandle />);
  await waitFor(() => {
    expect(queryByText(/click for .+/i)).not.toBeInTheDocument();
  });

  userEvent.hover(getByTitle(/handle/i));
  expect(await findByText(/click for .+/i)).toBeInTheDocument();

  userEvent.unhover(getByTitle(/handle/i));
  await waitFor(() => {
    expect(queryByText(/click for .+/i)).not.toBeInTheDocument();
  });
});

it('emits a changeMenuOpen event when clicking the handle', () => {
  const handleChangeMenuOpen = jest.fn();
  const { getByTitle } = render(
    <BlockDragHandle onChangeMenuOpen={handleChangeMenuOpen} />
  );

  userEvent.click(getByTitle(/handle/i));
  expect(handleChangeMenuOpen).toHaveBeenLastCalledWith(true);
});

describe('when the menu is open', () => {
  it('renders the menu items', () => {
    const { queryAllByRole, rerender } = render(<BlockDragHandle />);
    expect(queryAllByRole('menuitem')).toHaveLength(0);

    rerender(<BlockDragHandle menuOpen />);
    expect(queryAllByRole('menuitem')).not.toHaveLength(0);
  });

  it('emits delete events', () => {
    const handleDelete = jest.fn();
    const { getByTitle } = render(
      <BlockDragHandle menuOpen onDelete={handleDelete} />
    );

    userEvent.click(getByTitle(/del/i));
    expect(handleDelete).toHaveBeenCalled();
  });
});
