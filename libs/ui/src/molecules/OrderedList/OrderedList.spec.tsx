import { getAllByRole, render, screen } from '@testing-library/react';
import { OrderedList } from './OrderedList';

it('renders a list with an item for each child', () => {
  render(
    <OrderedList>
      <div>Item 1</div>
      <div>Item 2</div>
    </OrderedList>
  );
  expect(screen.getByRole('list')).toBeVisible();

  expect(getAllByRole(screen.getByRole('list'), 'listitem')).toEqual([
    expect.objectContaining({ textContent: 'Item 1' }),
    expect.objectContaining({ textContent: 'Item 2' }),
  ]);
});
