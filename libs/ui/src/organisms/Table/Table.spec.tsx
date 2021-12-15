import { render } from '@testing-library/react';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { Table } from './Table';

const body = (
  <tbody>
    <TableRow readOnly>
      <TableData>Cell 1.1</TableData>
      <TableData>Cell 1.2</TableData>
    </TableRow>
    <TableRow readOnly>
      <TableData>Cell 2.1</TableData>
      <TableData>Cell 2.2</TableData>
    </TableRow>
  </tbody>
);

it('renders children', () => {
  const { getAllByRole } = render(<Table>{body}</Table>);

  const rows = getAllByRole('row');
  const cells = getAllByRole('cell');

  expect(rows).toHaveLength(2);
  expect(cells).toHaveLength(4);
  [...rows, ...cells].forEach((element) => expect(element).toBeVisible());
});
