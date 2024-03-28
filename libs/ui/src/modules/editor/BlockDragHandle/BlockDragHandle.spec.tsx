import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockDragHandle } from './BlockDragHandle';
import { Plate } from '@udecode/plate-common';

it('shows a tooltip when focussing the handle', async () => {
  const { queryByText, findByText, getAllByTitle } = render(
    <Plate>
      <BlockDragHandle />
    </Plate>
  );
  await waitFor(() => {
    expect(queryByText(/for options/i)).not.toBeInTheDocument();
  });

  await userEvent.hover(getAllByTitle(/handle/i)[0]);
  expect(await findByText(/for options/i)).toBeInTheDocument();

  await userEvent.unhover(getAllByTitle(/handle/i)[0]);
  await waitFor(() => {
    expect(queryByText(/for options/i)).not.toBeInTheDocument();
  });
});

it('emits a changeMenuOpen event when clicking the handle', async () => {
  const handleChangeMenuOpen = jest.fn();
  const { getAllByTitle } = render(
    <Plate>
      <BlockDragHandle onChangeMenuOpen={handleChangeMenuOpen} />
    </Plate>
  );

  await userEvent.click(getAllByTitle(/handle/i)[0]);
  expect(handleChangeMenuOpen).toHaveBeenLastCalledWith(true);
});

describe('when the menu is open', () => {
  it('renders the menu items', () => {
    const { queryAllByRole, rerender } = render(
      <Plate>
        <BlockDragHandle />
      </Plate>
    );
    expect(queryAllByRole('menuitem')).toHaveLength(0);

    rerender(
      <Plate>
        <BlockDragHandle menuOpen />
      </Plate>
    );
    expect(queryAllByRole('menuitem')).not.toHaveLength(0);
  });
});
