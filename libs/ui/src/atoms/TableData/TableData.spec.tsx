import { render } from '@testing-library/react';
import { TableData } from './TableData';

it('renders the text', () => {
  const { getByText } = render(
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

  expect(getByText('Td Element')).toBeVisible();
});
