import { fireEvent, render } from '@testing-library/react';

import { TableColumnMenu } from './TableColumnMenu';

it('renders trigger icon', () => {
  const { getByTitle } = render(<TableColumnMenu />);
  expect(getByTitle(/caret down/i)).toBeInTheDocument();
});

it('renders menu when clicking the trigger icon', async () => {
  const { getByTitle, findAllByRole, queryAllByRole } = render(
    <TableColumnMenu />
  );

  expect(await queryAllByRole('menuitem')).toHaveLength(0);

  // Internally the dropdown uses a pointerdown event.
  fireEvent.pointerDown(getByTitle(/caret down/i).closest('button')!);

  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});
