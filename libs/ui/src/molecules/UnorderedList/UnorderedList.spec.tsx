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

it('uses different bullets at different depths', () => {
  const { getByText } = render(
    <>
      <UnorderedList>
        <div>List 1</div>
        <UnorderedList>
          <div>List 1 List 1</div>
        </UnorderedList>
      </UnorderedList>
      <UnorderedList>
        <div>List 2</div>
      </UnorderedList>
    </>
  );

  expect(
    getByText('List 1').closest('li')!.querySelector('svg')!.innerHTML
  ).toEqual(getByText('List 2').closest('li')!.querySelector('svg')!.innerHTML);
  expect(
    getByText('List 1').closest('li')!.querySelector('svg')!.innerHTML
  ).not.toEqual(
    getByText('List 1 List 1').closest('li')!.querySelector('svg')!.innerHTML
  );
});
