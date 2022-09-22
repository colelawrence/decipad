import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import type { TableCellType } from '@decipad/editor-types';
import { ONE } from '@decipad/fraction';
import { mockConsoleWarn } from '@decipad/testutils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { getDateType, getNumberType, getStringType } from '../../utils';
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
  const { findByText, getByText } = render(
    <TableColumnMenu
      {...props}
      trigger={<button>trigger</button>}
      onChangeOpen={handleChangeOpen}
    />
  );
  expect(getByText('trigger')).toBeInTheDocument();

  await userEvent.click(getByText('trigger'));
  await userEvent.click(await findByText(/change type/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.click(await findByText(/date/i), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/month/i)).toBeInTheDocument();
});

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

const types: [string, TableCellType, string][] = [
  ['string', getStringType(), 'Text'],
  ['number', getNumberType(), 'Number'],
  [
    'currency eur',
    getNumberType([
      {
        unit: 'euro',
        exp: ONE,
        multiplier: ONE,
        known: true,
        baseQuantity: 'EUR',
        baseSuperQuantity: 'currency',
      },
    ]),
    'EUR',
  ],

  ['date time', getDateType('minute'), 'Time'],
  ['date day', getDateType('day'), 'Day'],
  ['date month', getDateType('month'), 'Month'],
  ['date year', getDateType('year'), 'Year'],
];
it.each(types)('highlights selected type %s', async (_, type, textContent) => {
  const { findByRole, findAllByRole, findByText } = render(
    <TableColumnMenu trigger={<button>trigger</button>} type={type} open />
  );

  // Open every dropdown level
  await userEvent.click(await findByText(/change type/i), {
    pointerEventsCheck: 0,
  });

  if (
    type.kind === 'number' &&
    type.unit &&
    type.unit[0].baseSuperQuantity === 'currency'
  ) {
    await userEvent.click(await findByText(/currency/i), {
      pointerEventsCheck: 0,
    });

    await findByText(/eur/i);
  } else {
    await userEvent.click(await findByText(/date/i), {
      pointerEventsCheck: 0,
    });
    await findByText(/month/i);
  }

  cleanup = await applyCssVars();

  const menuItem = await findByRole(
    (role, element) =>
      role === 'menuitem' && element?.textContent?.includes(textContent)
  );

  const [otherMenuItem] = await findAllByRole(
    (role, element) =>
      role === 'menuitem' &&
      element?.textContent?.includes(textContent) === false
  );

  const { backgroundColor: normalBackgroundColor } = findParentWithStyle(
    otherMenuItem,
    'backgroundColor'
  )!;
  const { backgroundColor } = findParentWithStyle(menuItem, 'backgroundColor')!;
  expect(backgroundColor).not.toEqual(normalBackgroundColor);
});

const expandableCols: [string, string][] = [
  ['Currency', 'EUR'],
  ['Date', 'Year'],
];

it.each(expandableCols)(
  'Expands %s without any other menu open',
  async (col, content) => {
    const { getByText, findByText, queryByText } = render(
      <TableColumnMenu
        trigger={<button>trigger</button>}
        type={getNumberType()}
        open
      />
    );
    await userEvent.click(await findByText(/change type/i), {
      pointerEventsCheck: 0,
    });
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
  const { getAllByText, queryByText, getByText, findByText } = render(
    <TableColumnMenu
      trigger={<button>trigger</button>}
      type={getNumberType()}
      open
    />
  );
  await userEvent.click(await findByText(/change type/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.click(getByText('Series'));
  getAllByText('Date').forEach((el) => expect(el).toBeVisible());
  expect(getAllByText('Date')).toHaveLength(2);
  expandableCols.forEach(([, columnContent]) => {
    expect(queryByText(columnContent)).not.toBeInTheDocument();
  });
});

it('Successfully changes column type upon click', async () => {
  const mockOnChangeColumnType = jest.fn((type) => type);

  const { findByRole, findByText } = render(
    <TableColumnMenu
      trigger={<button>trigger</button>}
      type={getNumberType()}
      open
      onChangeColumnType={mockOnChangeColumnType}
    />
  );

  await userEvent.click(await findByText(/change type/i), {
    pointerEventsCheck: 0,
  });

  const menuItem = await findByRole(
    (role, element) =>
      role === 'menuitem' && element?.textContent?.includes('Text')
  );

  expect(mockOnChangeColumnType).not.toHaveBeenCalled();

  await userEvent.click(menuItem, {
    pointerEventsCheck: 0,
  });

  expect(mockOnChangeColumnType).toHaveBeenCalled();
});
