import { render } from '@testing-library/react';
import { TableData } from './TableData';

it('renders the text', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <TableData>Td Element</TableData>
        </tr>
      </tbody>
    </table>
  );

  expect(getByText('Td Element')).toBeVisible();
});
