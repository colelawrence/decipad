import { render } from '@testing-library/react';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { Table } from './Table';

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
