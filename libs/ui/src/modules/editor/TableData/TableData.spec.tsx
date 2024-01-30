import { render, screen } from '@testing-library/react';
import { TableData } from './TableData';

it('renders the text', () => {
  render(
    <table>
      <tbody>
        <tr>
          <td>
            <TableData>Td Element</TableData>
          </td>
        </tr>
      </tbody>
    </table>
  );

  expect(screen.getByText('Td Element')).toBeVisible();
});
