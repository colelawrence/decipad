import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TableData } from '../TableData/TableData';

import { Table } from './Table';
import { TableRow } from '../TableRow/TableRow';

const body = (
  <>
    <TableRow readOnly>
      <td>
        <TableData>Cell 1.1</TableData>
      </td>
      <td>
        <TableData>Cell 1.2</TableData>
      </td>
    </TableRow>
    <TableRow readOnly>
      <td>
        <TableData>Cell 2.1</TableData>
      </td>
      <td>
        <TableData>Cell 2.2</TableData>
      </td>
    </TableRow>
  </>
);

it('renders children', () => {
  const { getAllByRole } = render(<Table body={body} />);

  const rows = getAllByRole('row');
  const cells = getAllByRole('cell');

  expect(rows).toHaveLength(3);
  expect(cells).toHaveLength(4);
  [...rows, ...cells].forEach((element) => expect(element).toBeVisible());
});
