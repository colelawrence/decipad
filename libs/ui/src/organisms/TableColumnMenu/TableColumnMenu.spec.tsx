import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyCssVars,
  findParentWithStyle,
  mockConsoleWarn,
} from '../../test-utils';
import { TableCellType, TableColumnMenu } from './TableColumnMenu';

it('renders trigger icon', () => {
  const { getByText } = render(
    <TableColumnMenu trigger={<button>trigger</button>} type="string" />
  );
  expect(getByText('trigger')).toBeInTheDocument();
});

it('renders menu when clicking the trigger icon', async () => {
  const { getByText, findAllByRole, queryAllByRole } = render(
    <TableColumnMenu trigger={<button>trigger</button>} type="string" />
  );

  expect(queryAllByRole('menuitem')).toHaveLength(0);

  // Internally the dropdown uses a pointerdown event.
  fireEvent.pointerDown(getByText('trigger'));

  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

const types: [TableCellType, string][] = [
  ['string', 'Text'],
  ['number', 'Number'],
  ['date/time', 'Time'],
  ['date/day', 'Day'],
  ['date/month', 'Month'],
  ['date/year', 'Year'],
];
it.each(types)('highlights selected type %s', async (type, textContent) => {
  const { findByRole, findAllByRole, findByText, getByText } = render(
    <TableColumnMenu trigger={<button>trigger</button>} type={type} />
  );

  // Open every dropdown level
  fireEvent.pointerDown(getByText('trigger'));
  userEvent.click(await findByText(/change type/i));
  userEvent.click(await findByText(/date/i));
  await findByText(/month/i);

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
