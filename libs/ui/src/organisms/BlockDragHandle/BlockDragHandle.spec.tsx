import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockDragHandle } from './BlockDragHandle';

it('shows a tooltip when focussing the handle', async () => {
  const { queryByText, findByText, getAllByTitle } = render(
    <BlockDragHandle />
  );
  await waitFor(() => {
    expect(queryByText(/for options/i)).not.toBeInTheDocument();
  });

  await userEvent.hover(getAllByTitle(/handle/i)[1]);
  expect(await findByText(/for options/i)).toBeInTheDocument();

  await userEvent.unhover(getAllByTitle(/handle/i)[1]);
  await waitFor(() => {
    expect(queryByText(/for options/i)).not.toBeInTheDocument();
  });
});

it('emits a changeMenuOpen event when clicking the handle', async () => {
  const handleChangeMenuOpen = jest.fn();
  const { getAllByTitle } = render(
    <BlockDragHandle onChangeMenuOpen={handleChangeMenuOpen} />
  );

  await userEvent.click(getAllByTitle(/handle/i)[0]);
  expect(handleChangeMenuOpen).toHaveBeenLastCalledWith(true);
});

describe('when the menu is open', () => {
  it('renders the menu items', () => {
    const { queryAllByRole, rerender } = render(<BlockDragHandle />);
    expect(queryAllByRole('menuitem')).toHaveLength(0);

    rerender(<BlockDragHandle menuOpen />);
    expect(queryAllByRole('menuitem')).not.toHaveLength(0);
  });
});
