import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TableColumnActions } from './TableColumnActions';

it('auto-focuses the first button in the menu when mounted', async () => {
  const { getByTitle } = render(<TableColumnActions />);
  expect(getByTitle(/type/i).closest('button')).toHaveFocus();
});

it('opens and closes (auto-focused) submenus', async () => {
  const { getByTitle, getAllByRole } = render(<TableColumnActions />);
  expect(getAllByRole('list').length).toEqual(1);

  userEvent.click(getByTitle(/type/i));
  expect(getAllByRole('list').length).toEqual(2);
  expect(getByTitle(/number/i).closest('button')).toHaveFocus();

  userEvent.click(getByTitle(/type/i));
  expect(getAllByRole('list').length).toEqual(1);
});

it('some buttons result in onChangeColumnType when clicked', async () => {
  const onChange = jest.fn();
  const { getByTitle } = render(
    <TableColumnActions onChangeColumnType={onChange} />
  );
  userEvent.click(getByTitle(/type/i));

  userEvent.click(getByTitle(/number/i));
  expect(onChange).toHaveBeenCalledWith('number');
});
