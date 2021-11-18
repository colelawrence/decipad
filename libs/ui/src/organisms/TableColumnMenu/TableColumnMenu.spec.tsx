import { fireEvent, render } from '@testing-library/react';

import { TableColumnMenu } from './TableColumnMenu';

it('renders trigger icon', () => {
  const { getByText } = render(
    <TableColumnMenu trigger={<button>trigger</button>} />
  );
  expect(getByText('trigger')).toBeInTheDocument();
});

it('renders menu when clicking the trigger icon', async () => {
  const { getByText, findAllByRole, queryAllByRole } = render(
    <TableColumnMenu trigger={<button>trigger</button>} />
  );

  expect(await queryAllByRole('menuitem')).toHaveLength(0);

  // Internally the dropdown uses a pointerdown event.
  fireEvent.pointerDown(getByText('trigger'));

  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});
