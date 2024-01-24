import { mockConsoleWarn } from '@decipad/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { getNumberType, getStringType } from '../../utils';
import { TableColumnMenu } from './TableColumnMenu';

const props: ComponentProps<typeof TableColumnMenu> = {
  type: getStringType(),
  trigger: 'trigger',
};

it('renders trigger icon', () => {
  const { getByText } = render(
    <TableColumnMenu {...props} trigger={<button>trigger</button>} />
  );
  expect(getByText('trigger')).toBeInTheDocument();
});
it('emits a changeOpen event when clicking the trigger', async () => {
  const handleChangeOpen = jest.fn();
  const { getByText } = render(
    <TableColumnMenu
      {...props}
      trigger={<button>trigger</button>}
      onChangeOpen={handleChangeOpen}
    />
  );
  expect(getByText('trigger')).toBeInTheDocument();

  await userEvent.click(getByText('trigger'));
  expect(handleChangeOpen).toHaveBeenLastCalledWith(true);
});

it('renders the menu only when open', async () => {
  const { rerender, findAllByRole, queryAllByRole } = render(
    <TableColumnMenu {...props} />
  );
  expect(queryAllByRole('menuitem')).toHaveLength(0);

  rerender(<TableColumnMenu {...props} open />);
  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});

it('shows the sub menu', async () => {
  const handleChangeOpen = jest.fn();
  const { findByText, getByText, rerender } = render(
    <TableColumnMenu
      {...props}
      trigger={<button>trigger</button>}
      onChangeOpen={handleChangeOpen}
    />
  );
  expect(getByText('trigger')).toBeInTheDocument();

  await userEvent.click(getByText('trigger'));
  expect(handleChangeOpen.mock.calls).toHaveLength(1);
  expect(handleChangeOpen.mock.calls[0][0]).toBe(true);
  rerender(
    <TableColumnMenu
      {...props}
      trigger={<button>trigger</button>}
      onChangeOpen={handleChangeOpen}
      open
    />
  );
  await userEvent.click(await findByText(/date/i), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/month/i)).toBeInTheDocument();
});

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

const expandableCols: [string, string][] = [
  ['Currency', 'EUR'],
  ['Date', 'Year'],
];

it.each(expandableCols)(
  'Expands %s without any other menu open',
  async (col, content) => {
    const { getByText, queryByText } = render(
      <TableColumnMenu
        trigger={<button>trigger</button>}
        type={getNumberType()}
        open
      />
    );

    await userEvent.click(getByText(col));
    expect(getByText(content)).toBeVisible();
    expandableCols.forEach(([column, columnContent]) => {
      if (column !== col) {
        // eslint-disable-next-line
        expect(queryByText(columnContent)).not.toBeInTheDocument();
      }
    });
  }
);

// Cannot do this in the test above because there would be 2 elements with the
// text content 'Date', so it's cleaner to duplicate the text.
it('Expands the series menu without any other menu opening', async () => {
  const { getAllByText, queryByText, getByText } = render(
    <TableColumnMenu
      trigger={<button>trigger</button>}
      type={getNumberType()}
      open
    />
  );
  await userEvent.click(getByText('Sequence'));
  getAllByText('Date').forEach((el) => expect(el).toBeVisible());
  expect(getAllByText('Date')).toHaveLength(2);
  expandableCols.forEach(([, columnContent]) => {
    expect(queryByText(columnContent)).not.toBeInTheDocument();
  });
});

it('Successfully changes column type upon click', async () => {
  const mockOnChangeColumnType = jest.fn((type) => type);

  const { queryAllByRole } = render(
    <TableColumnMenu
      trigger={<button>trigger</button>}
      type={getNumberType()}
      open
      onChangeColumnType={mockOnChangeColumnType}
    />
  );

  const menuItems = queryAllByRole('menuitem');
  const menuItem = menuItems.find((element) =>
    element?.textContent?.includes('Text')
  ) as HTMLElement;

  expect(mockOnChangeColumnType).not.toHaveBeenCalled();

  await userEvent.click(menuItem, {
    pointerEventsCheck: 0,
  });

  expect(mockOnChangeColumnType).toHaveBeenCalled();
});
