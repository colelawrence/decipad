import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TableColumnActions } from './TableColumnActions';

it('auto-focuses the first button in the menu when mounted', async () => {
  const { getByText } = render(<TableColumnActions />);
  expect(getByText(/type/i).closest('button')).toHaveFocus();
});

it('opens and closes (auto-focused) submenus', async () => {
  const { getByText, getByTitle, getAllByRole } = render(
    <TableColumnActions />
  );
  expect(getAllByRole('list').length).toEqual(1);

  userEvent.click(getByText(/type/i));
  expect(getAllByRole('list').length).toEqual(2);
  expect(getByTitle(/number/i).closest('button')).toHaveFocus();

  userEvent.click(getByText(/type/i));
  expect(getAllByRole('list').length).toEqual(1);
});

it('some buttons result in onChangeColumnType when clicked', async () => {
  const onChange = jest.fn();
  const { getByText, getByTitle } = render(
    <TableColumnActions onChangeColumnType={onChange} />
  );
  userEvent.click(getByText(/type/i));

  userEvent.click(getByTitle(/number/i));
  expect(onChange).toHaveBeenCalledWith('number');
});

it('can open a nested menu', async () => {
  const onChange = jest.fn();
  const { getByText, getAllByRole } = render(
    <TableColumnActions onChangeColumnType={onChange} />
  );

  userEvent.click(getByText(/type/i));
  userEvent.click(getByText(/date/i));

  expect(getAllByRole('list').length).toEqual(3);

  userEvent.click(getByText(/month/i));

  expect(onChange).toHaveBeenCalledWith('date/month');
});
