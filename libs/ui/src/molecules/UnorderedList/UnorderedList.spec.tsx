import { getAllByRole, render } from '@testing-library/react';
import { UnorderedList } from './UnorderedList';

it('renders a list with an item for each child', () => {
  const { getByRole } = render(
    <UnorderedList>
      <div>Item 1</div>
      <div>Item 2</div>
    </UnorderedList>
  );
  expect(getByRole('list')).toBeVisible();

  expect(getAllByRole(getByRole('list'), 'listitem')).toEqual([
    expect.objectContaining({ textContent: expect.stringContaining('Item 1') }),
    expect.objectContaining({ textContent: expect.stringContaining('Item 2') }),
  ]);
});
