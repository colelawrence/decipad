import { render, screen } from '@testing-library/react';
import { TableData } from '../../atoms';
import { TableRow } from './TableRow';

it('renders a table data', () => {
  render(
    <table>
      <tbody>
        <TableRow>
          <td>
            <TableData>Table Data</TableData>
          </td>
        </TableRow>
      </tbody>
    </table>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});
