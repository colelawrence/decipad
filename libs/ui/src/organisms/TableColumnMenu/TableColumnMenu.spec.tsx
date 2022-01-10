import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { TableCellType, TableColumnMenu } from './TableColumnMenu';

const props: ComponentProps<typeof TableColumnMenu> = {
  type: 'string',
  trigger: 'trigger',
};

it('renders trigger icon', () => {
  const { getByText } = render(
    <TableColumnMenu {...props} trigger={<button>trigger</button>} />
  );
  expect(getByText('trigger')).toBeInTheDocument();
});
it('emits a changeOpen event when clicking the trigger', () => {
  const handleChangeOpen = jest.fn();
  const { getByText } = render(
    <TableColumnMenu
      {...props}
      trigger={<button>trigger</button>}
      onChangeOpen={handleChangeOpen}
    />
  );
  expect(getByText('trigger')).toBeInTheDocument();

  userEvent.click(getByText('trigger'));
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
  const { findByRole, findAllByRole, findByText } = render(
    <TableColumnMenu trigger={<button>trigger</button>} type={type} open />
  );

  // Open every dropdown level
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
